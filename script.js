class CleaningSchedule {
    constructor() {
        this.names = [];
        this.jobs = [];
        this.history = [];
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

    loadHistory() {
        try {
            const saved = localStorage.getItem('cleaningScheduleHistory');
            this.history = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.log('Could not load history from localStorage:', error);
            this.history = [];
        }
        this.displayHistory();
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

        // Scroll to top to show newest entry
        list.scrollTop = 0;
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.displayHistory();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CleaningSchedule();
});
