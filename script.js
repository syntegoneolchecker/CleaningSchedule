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

            var syntegonS = confetti.shapeFromPath({
                path: 'M11.78 9.89a5.7 5.7 0 0 1 1.46-.54 7.3 7.3 0 0 1 4.25.34 4.7 4.7 0 0 1 2.18 1.46l.47.6 6.07-6.6-.49-.43a13.5 13.5 0 0 0-5.07-2.86 19 19 0 0 0-10.74-.12 13 13 0 0 0-4.35 2.19 11 11 0 0 0-3 3.65 10.9 10.9 0 0 0-1.15 5.08 8.6 8.6 0 0 0 1.29 4.9 9.9 9.9 0 0 0 3.14 3 18 18 0 0 0 4 1.73c1.36.41 2.62.83 3.79 1.24.99.326 1.924.802 2.77 1.41a2.23 2.23 0 0 1 .91 1.9 2.1 2.1 0 0 1-.34 1.21 2.9 2.9 0 0 1-1 .9 5.4 5.4 0 0 1-1.49.58 7.5 7.5 0 0 1-5-.58 7.2 7.2 0 0 1-2.66-2.17l-.56-.63L0 33.03l.47.44a16.1 16.1 0 0 0 5.48 3.38 19.8 19.8 0 0 0 11.51.3 12.8 12.8 0 0 0 4.37-2.17 10.66 10.66 0 0 0 3-3.71 11.5 11.5 0 0 0 1.12-5.21 9.3 9.3 0 0 0-1.25-5.09 9.7 9.7 0 0 0-3.1-3 16 16 0 0 0-3.91-1.69c-1.33-.38-2.57-.76-3.73-1.14a10.3 10.3 0 0 1-2.72-1.3 2.33 2.33 0 0 1-.51-3.06 2.8 2.8 0 0 1 1.05-.89',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonY = confetti.shapeFromPath({
                path: 'M45.32 13.88 38.5 1.84 27.64 1.84 40.92 22.11 40.92 37.01 49.68 37.01 49.68 22.11 62.96 1.84 52.54 1.84z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonN = confetti.shapeFromPath({
                path: 'M91.99 23.89 78.5 1.84 67.35 1.84 67.35 37.01 76.11 37.01 76.11 14.38 89.98 37.01 100.75 37.01 100.75 1.84 91.99 1.84z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonT = confetti.shapeFromPath({
                path: 'M105.25 9.74 114.92 9.74 114.92 37.01 123.68 37.01 123.68 9.74 133.35 9.74 133.35 1.84 105.25 1.84z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonE = confetti.shapeFromPath({
                path: 'M146.86 23.23 161.55 23.23 161.55 15.05 146.86 15.05 146.86 10.02 162.41 10.02 162.41 1.84 138.1 1.84 138.1 37.01 163.28 37.01 163.28 28.83 146.86 28.83z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonG = confetti.shapeFromPath({
                path: 'M186.98,23.8 L193.05,23.8 L193.05,28.26 C192.28193,28.614843 191.490001,28.9155756 190.68,29.16 C189.379361,29.5284545 188.031614,29.7036617 186.68,29.68 C185.283276,29.6971925 183.896857,29.438938 182.6,28.92 C181.432436,28.4329969 180.377312,27.7114281 179.5,26.8 C178.621113,25.8701631 177.940639,24.7711982 177.5,23.57 C177.022508,22.2425604 176.785467,20.8406321 176.8,19.43 C176.78939,18.0229402 177.026333,16.624979 177.5,15.3 C177.93582,14.0934991 178.616787,12.9903324 179.5,12.06 C180.374685,11.1454719 181.4305,10.423431 182.6,9.94 C183.895511,9.41643884 185.282867,9.1580099 186.68,9.18 C188.222236,9.12991955 189.758947,9.38830458 191.2,9.94 C192.410867,10.4529293 193.505987,11.204549 194.42,12.15 L194.9,12.64 L201.06,5.93 L200.59,5.49 C198.809784,3.84208338 196.664563,2.63925212 194.33,1.98 C191.8357,1.29154834 189.257445,0.954961518 186.67,0.98 C184.106149,0.964846556 181.55997,1.40501048 179.15,2.28 C176.919857,3.09384194 174.878498,4.35268008 173.15,5.98 C171.417273,7.62069221 170.053713,9.61148975 169.15,11.82 C167.269598,16.7156455 167.269598,22.1343545 169.15,27.03 C170.051263,29.2398301 171.415157,31.2311151 173.15,32.87 C174.878498,34.4973199 176.919857,35.7561581 179.15,36.57 C181.567299,37.4413429 184.120572,37.8747897 186.69,37.85 C189.193846,37.8525651 191.690983,37.5911198 194.14,37.07 C196.578152,36.5461854 198.933277,35.6916114 201.14,34.53 L201.49,34.35 L201.49,15.63 L186.98,15.63 L186.98,23.8 Z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });
            var syntegonO = confetti.shapeFromPath({
                path: 'M208.22,37.01 L243.4,37.01 L243.4,1.84 L208.22,1.84 L208.22,37.01 Z M216.39,10.01 L235.22,10.01 L235.22,28.84 L216.39,28.84 L216.39,10.01 Z',
                matrix: [0.75, 0, 0, 0.75, -1.85, -1.85]
            });

            confetti({
                scalar: 1,
                spread: 180,
                particleCount: 30,
                origin: { y: -0.1 },
                startVelocity: -30,
                shapes: [syntegonS, syntegonY, syntegonN, syntegonT, syntegonE, syntegonG, syntegonO],
                colors: ['#00be82']
            });

            var defaults = {

            };

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

        // Show celebration gif
        document.getElementById('celebrationGif').style.display = 'block';
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
