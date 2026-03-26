class CleaningSchedule {
    constructor() {
        this.names = [];
        this.jobs = [];
        this.history = [];
        this.radarChart = null;
        this.initializeEventListeners();
        this.loadFromLocalStorage();
        this.loadHistory();
    }

    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateSchedule();
        });

        document.getElementById('fileInput').addEventListener('change', (event) => {
            this.handleFileUpload(event);
        });

        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });
    }

    loadFromLocalStorage() {
        try {
            const savedNames = localStorage.getItem('cleaningScheduleNames');
            const savedJobs = localStorage.getItem('cleaningScheduleJobs');
            if (savedNames) {
                this.names = savedNames.split(' ').filter(name => name);
            }
            if (savedJobs) {
                this.jobs = savedJobs.split(' ').filter(job => job);
            }
            if (this.names.length || this.jobs.length) {
                this.populateInputs();
            }
        } catch (error) {
            console.log('Could not load from localStorage:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('cleaningScheduleNames', this.names.join(' '));
            localStorage.setItem('cleaningScheduleJobs', this.jobs.join(' '));
        } catch (error) {
            console.log('Could not save to localStorage:', error);
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.parseFileContent(e.target.result);
                this.populateInputs();
            };
            reader.readAsText(file);
        }
    }

    parseFileContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length >= 2) {
            this.names = lines[0].trim().split(' ').filter(name => name);
            this.jobs = lines[1].trim().split(' ').filter(job => job);
        }
    }

    populateInputs() {
        document.getElementById('namesInput').value = this.names.join(' ');
        document.getElementById('jobsInput').value = this.jobs.join(' ');
    }

    generateSchedule() {
        try {
            // Get values from inputs
            const namesInput = document.getElementById('namesInput').value.trim();
            const jobsInput = document.getElementById('jobsInput').value.trim();

            if (!namesInput || !jobsInput) {
                throw new Error('Please enter both names and cleaning areas');
            }

            this.names = namesInput.split(' ').filter(name => name);
            this.jobs = jobsInput.split(' ').filter(job => job);

            this.saveToLocalStorage();

            if (this.names.length < 2) {
                throw new Error('Please enter at least 2 names');
            }

            if (this.jobs.length * 2 > this.names.length) {
                throw new Error(`Not enough names for the cleaning areas. Need ${this.jobs.length * 2} names but only have ${this.names.length}`);
            }

            // Create a copy of names and shuffle
            const shuffledNames = [...this.names];
            this.shuffle(shuffledNames);

            // Generate assignments
            const assignments = [];
            const namesCopy = [...shuffledNames];

            for (let i = 0; i < this.jobs.length; i++) {
                if (namesCopy.length >= 2) {
                    assignments.push({
                        job: this.jobs[i],
                        person1: namesCopy[0],
                        person2: namesCopy[1]
                    });
                    namesCopy.splice(0, 2);
                }
            }

            // Save to history
            this.addToHistory(assignments, namesCopy);

            // Display results
            this.displayResults(shuffledNames, assignments, namesCopy);
            this.hideError();

        } catch (error) {
            this.showError(error.message);
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    displayResults(originalNames, assignments, noCleaning) {
        // Display names and jobs
        document.getElementById('namesList').textContent = originalNames.join(' ');
        document.getElementById('jobsList').textContent = this.jobs.join(' ');

        // Display assignments
        const assignmentList = document.getElementById('assignmentList');
        assignmentList.innerHTML = '';

        assignments.forEach(assignment => {
            const assignmentElement = document.createElement('div');
            assignmentElement.className = 'assignment-item';
            assignmentElement.textContent =
                `Area to clean: ${assignment.job} ----> ${assignment.person1} and ${assignment.person2}`;
            assignmentList.appendChild(assignmentElement);
        });

        // Display no cleaning list
        document.getElementById('noCleaningList').textContent =
            noCleaning.length > 0 ? noCleaning.join(' ') : 'None';

        // Show output section
        document.getElementById('output').style.display = 'block';
    }

    showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        document.getElementById('output').style.display = 'none';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    // ── History ──

    loadHistory() {
        try {
            const saved = localStorage.getItem('cleaningScheduleHistory');
            this.history = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.log('Could not load history from localStorage:', error);
            this.history = [];
        }
        this.displayHistory();
        this.updateCharts();
    }

    saveHistory() {
        try {
            localStorage.setItem('cleaningScheduleHistory', JSON.stringify(this.history));
        } catch (error) {
            console.log('Could not save history to localStorage:', error);
        }
    }

    addToHistory(assignments, noCleaning) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const entry = {
            date: `${year}/${month}/${day}`,
            assignments: assignments.map(a => ({
                job: a.job,
                person1: a.person1,
                person2: a.person2
            })),
            noCleaning: [...noCleaning]
        };

        this.history.push(entry);
        this.saveHistory();
        this.displayHistory();
        this.updateCharts();
    }

    displayHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = '';

        if (this.history.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-empty';
            empty.textContent = 'No schedules generated yet.';
            list.appendChild(empty);
            return;
        }

        // Display newest first
        for (let i = this.history.length - 1; i >= 0; i--) {
            const entry = this.history[i];
            const entryEl = document.createElement('div');
            entryEl.className = 'history-entry';

            const dateEl = document.createElement('div');
            dateEl.className = 'history-date';
            dateEl.textContent = entry.date;
            entryEl.appendChild(dateEl);

            entry.assignments.forEach(a => {
                const line = document.createElement('div');
                line.className = 'history-assignment';
                line.textContent = `${a.job}: ${a.person1} & ${a.person2}`;
                entryEl.appendChild(line);
            });

            if (entry.noCleaning && entry.noCleaning.length > 0) {
                const noClean = document.createElement('div');
                noClean.className = 'history-no-cleaning';
                noClean.textContent = `No cleaning: ${entry.noCleaning.join(', ')}`;
                entryEl.appendChild(noClean);
            }

            list.appendChild(entryEl);
        }

        list.scrollTop = 0;
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.displayHistory();
        this.updateCharts();
    }

    // ── Chart data aggregation ──

    aggregateHistory() {
        const people = new Set();
        const areas = new Set();
        const counts = {};
        const noCleanLabel = 'No cleaning';

        for (const entry of this.history) {
            for (const a of entry.assignments) {
                areas.add(a.job);
                for (const person of [a.person1, a.person2]) {
                    people.add(person);
                    if (!counts[person]) counts[person] = {};
                    counts[person][a.job] = (counts[person][a.job] || 0) + 1;
                }
            }
            if (entry.noCleaning) {
                for (const person of entry.noCleaning) {
                    people.add(person);
                    if (!counts[person]) counts[person] = {};
                    counts[person][noCleanLabel] = (counts[person][noCleanLabel] || 0) + 1;
                }
            }
        }

        // Put regular areas sorted first, then "No cleaning" at the end
        const sortedAreas = [...areas].sort();
        sortedAreas.push(noCleanLabel);

        return {
            people: [...people].sort(),
            areas: sortedAreas,
            counts,
            totalSchedules: this.history.length
        };
    }

    updateCharts() {
        this.renderHeatmap();
        this.renderRadarChart();
    }

    // ── Heatmap ──

    getHeatmapColor(count, maxCount) {
        if (count === 0 || maxCount === 0) return { bg: '#f8f9fa', text: '#adb5bd' };

        const ratio = count / maxCount;

        // Green (low) → Yellow (mid) → Red (high)
        let r, g, b;
        if (ratio <= 0.5) {
            const t = ratio / 0.5;
            r = Math.round(76 + t * (255 - 76));
            g = Math.round(175 + t * (210 - 175));
            b = Math.round(80 - t * 40);
        } else {
            const t = (ratio - 0.5) / 0.5;
            r = Math.round(255 - t * 35);
            g = Math.round(210 - t * 145);
            b = Math.round(40 - t * 10);
        }

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const textColor = luminance > 0.5 ? '#29323F' : '#ffffff';

        return { bg: `rgb(${r}, ${g}, ${b})`, text: textColor };
    }

    renderHeatmap() {
        const wrapper = document.getElementById('heatmapWrapper');
        const { people, areas, counts, totalSchedules } = this.aggregateHistory();

        if (people.length === 0 || areas.length === 0) {
            wrapper.innerHTML = '<div class="history-empty">No data yet.</div>';
            return;
        }

        // maxCount = totalSchedules since a person can be assigned to an area at most once per schedule
        const maxCount = totalSchedules;

        const table = document.createElement('table');
        table.className = 'heatmap-table';

        // Header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const nameHeader = document.createElement('th');
        nameHeader.className = 'heatmap-name-header';
        nameHeader.textContent = 'Person';
        headerRow.appendChild(nameHeader);

        for (const area of areas) {
            const th = document.createElement('th');
            th.textContent = area;
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Data rows
        const tbody = document.createElement('tbody');
        for (const person of people) {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.className = 'heatmap-name';
            nameCell.textContent = person;
            row.appendChild(nameCell);

            for (const area of areas) {
                const count = (counts[person] && counts[person][area]) || 0;
                const { bg, text } = this.getHeatmapColor(count, maxCount);

                const cell = document.createElement('td');
                cell.textContent = count;
                cell.style.backgroundColor = bg;
                cell.style.color = text;
                row.appendChild(cell);
            }

            tbody.appendChild(row);
        }
        table.appendChild(tbody);

        wrapper.innerHTML = '';
        wrapper.appendChild(table);
    }

    // ── Radar chart ──

    generatePersonColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.round((i * 360) / count);
            // Avoid near-white: saturation 70%, lightness 45%
            colors.push({
                solid: `hsl(${hue}, 70%, 45%)`,
                transparent: `hsla(${hue}, 70%, 45%, 0.15)`
            });
        }
        return colors;
    }

    renderRadarChart() {
        const { people, areas, counts, totalSchedules } = this.aggregateHistory();
        const emptyMsg = document.getElementById('radarEmpty');
        const canvas = document.getElementById('radarChart');

        if (people.length === 0 || areas.length === 0) {
            if (this.radarChart) {
                this.radarChart.destroy();
                this.radarChart = null;
            }
            canvas.style.display = 'none';
            canvas.removeAttribute('width');
            canvas.removeAttribute('height');
            canvas.style.width = '';
            canvas.style.height = '';
            emptyMsg.style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        emptyMsg.style.display = 'none';

        const colors = this.generatePersonColors(people.length);

        const datasets = people.map((person, i) => ({
            label: person,
            data: areas.map(area => (counts[person] && counts[person][area]) || 0),
            borderColor: colors[i].solid,
            backgroundColor: colors[i].transparent,
            borderWidth: 2,
            pointBackgroundColor: colors[i].solid,
            pointRadius: 3
        }));

        const config = {
            type: 'radar',
            data: {
                labels: areas,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: totalSchedules,
                        ticks: {
                            stepSize: 1,
                            backdropColor: 'transparent',
                            color: '#495057',
                            font: { size: 10 }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            color: '#29323F',
                            font: { size: 12, weight: '600' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#29323F',
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11 }
                        }
                    }
                }
            }
        };

        if (this.radarChart) {
            this.radarChart.data = config.data;
            this.radarChart.options = config.options;
            this.radarChart.update();
        } else {
            this.radarChart = new Chart(canvas, config);
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CleaningSchedule();
});
