/**
 * Quiz Application Controller
 * Handles state, DOM updates, and PDF generation
 */
const QuizApp = {
    // 1. State Management
    state: {
        user: {},
        currentSubject: '',
        questions: [],
        timerInterval: null,
        timeLeft: 600, // 10 minutes
        score: 0
    },

    // 2. Data Store
    repository: {
        ds: [
            { q: "Which DS uses LIFO?", o: ["Queue", "Stack", "Tree", "Array"], a: "Stack" },
            { q: "Binary search complexity?", o: ["O(n)", "O(log n)", "O(1)", "O(n²)"], a: "O(log n)" },
            { q: "Heap stored in?", o: ["Array", "Tree", "Stack", "Graph"], a: "Array" },
            { q: "BFS uses?", o: ["Stack", "Queue", "Array", "List"], a: "Queue" },
            { q: "Balanced tree height?", o: ["log n", "n", "n²", "n log n"], a: "log n" },
            { q: "Stable sorting?", o: ["Merge", "Quick", "Heap", "Selection"], a: "Merge" },
            { q: "Graph shortest path?", o: ["DFS", "BFS", "Dijkstra", "Prim"], a: "Dijkstra" },
            { q: "Linked list uses?", o: ["Pointers", "Indexes", "Nodes", "Trees"], a: "Pointers" },
            { q: "Which traversal root first?", o: ["Preorder", "Inorder", "Postorder", "Level"], a: "Preorder" },
            { q: "Which DS FIFO?", o: ["Stack", "Queue", "Heap", "Tree"], a: "Queue" }
        ],
        os: [
            { q: "FCFS is?", o: ["Preemptive", "Non-preemptive", "Hybrid", "None"], a: "Non-preemptive" },
            { q: "Deadlock conditions?", o: ["3", "4", "5", "6"], a: "4" },
            { q: "Avoid deadlock?", o: ["Banker", "FIFO", "LRU", "SCAN"], a: "Banker" },
            { q: "Virtual memory uses?", o: ["Disk", "RAM", "Cache", "CPU"], a: "Disk" },
            { q: "Thrashing cause?", o: ["Low paging", "High paging", "Deadlock", "Cache"], a: "High paging" },
            { q: "Semaphore used for?", o: ["Sync", "Memory", "File", "Driver"], a: "Sync" },
            { q: "Kernel is?", o: ["OS core", "Hardware", "Program", "Compiler"], a: "OS core" },
            { q: "Round Robin uses?", o: ["Quantum", "Priority", "Stack", "Queue"], a: "Quantum" },
            { q: "Process first state?", o: ["Ready", "Running", "Waiting", "Dead"], a: "Ready" },
            { q: "Page replacement?", o: ["LRU", "DFS", "BFS", "Prim"], a: "LRU" }
        ],
        cn: [
            { q: "Routing layer?", o: ["Network", "Transport", "Session", "Physical"], a: "Network" },
            { q: "TCP type?", o: ["Connection oriented", "Connectionless", "Slow", "Encrypted"], a: "Connection oriented" },
            { q: "DNS converts?", o: ["Domain to IP", "IP to domain", "URL", "File"], a: "Domain to IP" },
            { q: "HTTP port?", o: ["21", "25", "80", "443"], a: "80" },
            { q: "OSI layers?", o: ["5", "6", "7", "8"], a: "7" },
            { q: "UDP is?", o: ["Connectionless", "Reliable", "Slow", "Secure"], a: "Connectionless" },
            { q: "MAC bits?", o: ["48", "32", "64", "16"], a: "48" },
            { q: "Ping uses?", o: ["ICMP", "TCP", "UDP", "FTP"], a: "ICMP" },
            { q: "Star topology center?", o: ["Hub", "Switch", "Router", "Bridge"], a: "Hub" },
            { q: "IP means?", o: ["Internet Protocol", "Internal Process", "Input Port", "Internet Port"], a: "Internet Protocol" }
        ],
        dbms: [
            { q: "SQL stands for?", o: ["Structured Query Language", "Simple Query Language", "System Query Language", "Sequential Query Language"], a: "Structured Query Language" },
            { q: "Primary key?", o: ["Unique", "Duplicate", "Null", "Optional"], a: "Unique" },
            { q: "Normalization reduces?", o: ["Redundancy", "Speed", "Security", "Index"], a: "Redundancy" },
            { q: "2NF removes?", o: ["Partial dependency", "Full dependency", "Transitive", "Join"], a: "Partial dependency" },
            { q: "Foreign key?", o: ["Link tables", "Delete table", "Sort", "Index"], a: "Link tables" },
            { q: "DROP command?", o: ["Delete table", "Delete row", "Create table", "Update"], a: "Delete table" },
            { q: "JOIN used for?", o: ["Combine tables", "Delete", "Insert", "Sort"], a: "Combine tables" },
            { q: "Index improves?", o: ["Speed", "Security", "Storage", "Backup"], a: "Speed" },
            { q: "ACID A means?", o: ["Atomicity", "Accuracy", "Access", "Action"], a: "Atomicity" },
            { q: "Relational model uses?", o: ["Tables", "Trees", "Graphs", "Objects"], a: "Tables" }
        ]
    },

    // 3. UI Navigation Logic
    switchPage(hideId, showId) {
        document.getElementById(hideId).classList.add('hidden');
        document.getElementById(showId).classList.remove('hidden');
    },

    // 4. Core Methods
    handleUserRegistration() {
        const name = document.getElementById('name').value.trim();
        const roll = document.getElementById('roll').value.trim();
        const className = document.getElementById('class').value.trim();

        if (!name || !roll) {
            alert("Please fill in the required fields (Name and Roll No).");
            return;
        }

        this.state.user = { name, roll, className };
        this.switchPage('userPage', 'subjectPage');
    },

    initiateQuiz() {
        const subjectKey = document.getElementById('subject').value;
        if (!subjectKey) return alert("Please select a subject.");

        this.state.currentSubject = subjectKey;
        this.state.questions = this.repository[subjectKey];
        
        const quizForm = document.getElementById('quizForm');
        document.getElementById('title').innerText = `${subjectKey.toUpperCase()} Quiz`;

        // Modern Template Literals for Injection
        quizForm.innerHTML = this.state.questions.map((item, index) => `
            <article class="question">
                <p><strong>${index + 1}.</strong> ${item.q}</p>
                ${item.o.map(option => `
                    <label class="option-label">
                        <input type="radio" name="q${index}" value="${option}" required>
                        ${option}
                    </label><br>
                `).join('')}
            </article>
        `).join('');

        this.switchPage('subjectPage', 'quizPage');
        this.runTimer();
    },

    runTimer() {
        const display = document.getElementById('timer');
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;

            const mins = Math.floor(this.state.timeLeft / 60);
            const secs = this.state.timeLeft % 60;
            display.innerText = `Time Left: ${mins}:${secs.toString().padStart(2, '0')}`;

            if (this.state.timeLeft <= 0) this.processResults();
        }, 1000);
    },

    processResults() {
        clearInterval(this.state.timerInterval);
        
        let score = 0;
        let incorrectHTML = "";

        this.state.questions.forEach((item, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const isCorrect = selected && selected.value === item.a;

            if (isCorrect) {
                score++;
            } else {
                incorrectHTML += `
                    <div class="result-box">
                        <p><strong>Q: ${item.q}</strong></p>
                        <p style="color: var(--error-color)">Your Answer: ${selected ? selected.value : 'None'}</p>
                        <p style="color: var(--success-color)">Correct: ${item.a}</p>
                    </div>`;
            }
        });

        this.state.score = score;
        this.renderResultPage(incorrectHTML);
    },

    renderResultPage(incorrectHTML) {
        const { name, roll, className } = this.state.user;
        
        document.getElementById('resultInfo').innerHTML = `
            <div class="score-card">
                <h3>${name}</h3>
                <p>Roll No: ${roll} | Class: ${className}</p>
                <h2 style="color: var(--primary-color)">Final Score: ${this.state.score} / 10</h2>
            </div>
        `;

        document.getElementById('wrong').innerHTML = incorrectHTML || "<p>Perfect score! 🎉</p>";
        this.switchPage('quizPage', 'resultPage');
    },

    async downloadPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const { user, score, currentSubject } = this.state;

            doc.setFontSize(22);
            doc.text("Examination Report", 20, 20);
            
            doc.setFontSize(14);
            doc.text(`Subject: ${currentSubject.toUpperCase()}`, 20, 40);
            doc.text(`Student: ${user.name}`, 20, 50);
            doc.text(`Roll No: ${user.roll}`, 20, 60);
            doc.text(`Final Score: ${score}/10`, 20, 80);

            doc.save(`${user.name}_Result.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Could not generate PDF. Please try again.");
        }
    }
};

// Global Event Listeners (binding the object methods to the window)
window.nextPage = () => QuizApp.handleUserRegistration();
window.startQuiz = () => QuizApp.initiateQuiz();
window.submitQuiz = () => QuizApp.processResults();
window.downloadPDF = () => QuizApp.downloadPDF();
