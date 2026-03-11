/**
 * Professional Engineering Quiz Application
 * 
 * Uses a modular design pattern to manage State, DOM elements, and core logic
 * cleanly without globals cluttering the window scope.
 */

const quizData = {
    ds: [
        { q: "Which data structure operates on a Last In First Out (LIFO) principle?", options: ["Queue", "Stack", "Tree", "Graph"], ans: "Stack" },
        { q: "What is the worst-case time complexity of Binary Search?", options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"], ans: "O(log n)" },
        { q: "Which data structure is fundamentally used for Breadth-First Search (BFS)?", options: ["Stack", "Queue", "Array", "Linked List"], ans: "Queue" },
        { q: "What primary advantage does a balanced binary search tree (like AVL) provide?", options: ["O(1) search", "O(log n) search", "O(n) search", "Network clustering"], ans: "O(log n) search" },
        { q: "Which of the following is considered a non-linear data structure?", options: ["Array", "Linked List", "Stack", "Tree"], ans: "Tree" }
    ],
    os: [
        { q: "What is the core component of an operating system called?", options: ["Shell", "Kernel", "Command Prompt", "Bootloader"], ans: "Kernel" },
        { q: "Which scheduler controls the degree of multiprogramming?", options: ["Short-term scheduler", "Long-term scheduler", "Medium-term scheduler", "I/O scheduler"], ans: "Long-term scheduler" },
        { q: "What describes a state where two or more processes are waiting indefinitely for an event that can be caused by only one of the waiting processes?", options: ["Starvation", "Deadlock", "Race Condition", "Mutual Exclusion"], ans: "Deadlock" },
        { q: "Which page replacement algorithm replaces the page that has not been used for the longest period of time?", options: ["FIFO", "Optimal", "LRU (Least Recently Used)", "LFU"], ans: "LRU (Least Recently Used)" },
        { q: "What is Translation Lookaside Buffer (TLB) used for primarily?", options: ["Disk caching", "Context switching", "Fast address translation", "Interrupt handling"], ans: "Fast address translation" }
    ],
    cn: [
        { q: "How many layers constitute the OSI reference model?", options: ["4 layers", "5 layers", "6 layers", "7 layers"], ans: "7 layers" },
        { q: "Which protocol operates at the Transport layer to provide reliable, connection-oriented data delivery?", options: ["UDP", "IP", "TCP", "ICMP"], ans: "TCP" },
        { q: "What is the standard length of an IPv4 address?", options: ["16 bits", "32 bits", "64 bits", "128 bits"], ans: "32 bits" },
        { q: "Which layer of the OSI model is responsible for logical addressing and routing?", options: ["Transport Layer", "Network Layer", "Data Link Layer", "Physical Layer"], ans: "Network Layer" },
        { q: "What service is responsible for resolving human-readable domain names into IP addresses?", options: ["DHCP", "DNS", "ARP", "NAT"], ans: "DNS" }
    ],
    dbms: [
        { q: "What does SQL stand for?", options: ["Structured Query Language", "Standard Query Logic", "System Query Language", "Sequential Query Language"], ans: "Structured Query Language" },
        { q: "Which key constraint uniquely identifies a record within a relational database table?", options: ["Foreign Key", "Primary Key", "Candidate Key", "Super Key"], ans: "Primary Key" },
        { q: "What do the ACID properties in database transactions stand for?", options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Completeness, Integrity, Durability", "Action, Commit, Isolation, Data", "Availability, Consistency, Integrity, Delivery"], ans: "Atomicity, Consistency, Isolation, Durability" },
        { q: "Which DDL command is used to completely remove a table definition and all its data from the database?", options: ["DELETE", "TRUNCATE", "DROP", "WIPE"], ans: "DROP" },
        { q: "What describes the overall logical structure and design of a database?", options: ["Database instance", "Database schema", "Database view", "Data dictionary"], ans: "Database schema" }
    ]
};

class QuizApp {
    constructor() {
        this.state = {
            user: { name: "", roll: "", class: "" },
            quiz: {
                subjectId: "",
                subjectName: "",
                questions: [],
                score: 0,
                totalTime: 600, // 10 minutes (in seconds)
                timeLeft: 600,
                timerInterval: null
            }
        };

        this.DOM = {};

        // Wait for DOM to be ready before initializing elements
        document.addEventListener("DOMContentLoaded", () => this.init());
    }

    init() {
        // Cache DOM elements
        this.DOM = {
            pages: {
                user: document.getElementById("userPage"),
                subject: document.getElementById("subjectPage"),
                quiz: document.getElementById("quizPage"),
                result: document.getElementById("resultPage")
            },
            inputs: {
                name: document.getElementById("name"),
                roll: document.getElementById("roll"),
                class: document.getElementById("class")
            },
            quiz: {
                title: document.getElementById("quizTitle"),
                badge: document.getElementById("quizBadge"),
                timerText: document.getElementById("timerText"),
                timerContainer: document.getElementById("timer"),
                form: document.getElementById("quizForm"),
                progressBar: document.getElementById("progressBar"),
                progressText: document.getElementById("progressText"),
                progressPercent: document.getElementById("progressPercent")
            },
            result: {
                info: document.getElementById("resultInfo"),
                container: document.getElementById("reviewContainer"),
                scorePath: document.getElementById("scorePath"),
                scoreText: document.getElementById("scorePercentageText"),
                greeting: document.getElementById("resultGreeting")
            },
            toast: document.getElementById("toastContainer")
        };

        // Set up input validation clearing
        ['name', 'roll', 'class'].forEach(id => {
            if (this.DOM.inputs[id]) {
                this.DOM.inputs[id].addEventListener('input', (e) => this.clearError(e.target));
            }
        });
    }

    /* --- Navigation & Transitions --- */

    showPage(pageId) {
        // Hide all pages
        Object.values(this.DOM.pages).forEach(page => {
            if (page) {
                page.classList.remove("active");
                page.classList.add("hidden");
            }
        });

        // Show requested page with animation
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove("hidden");
            // Allow display block to apply before adding animation class
            requestAnimationFrame(() => {
                targetPage.classList.add("active");
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    goBack(currentId, targetId) {
        this.showPage(targetId);
    }

    /* --- UI Feedback (Toasts & Validation) --- */

    showToast(message, type = "error") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icon = type === 'success'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        this.DOM.toast.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => toast.classList.add("toast-show"));

        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 3000);
    }

    showError(inputElement, message) {
        inputElement.classList.add("invalid");
        const errorSpan = document.getElementById(`${inputElement.id}Error`);
        if (errorSpan) errorSpan.textContent = message;
    }

    clearError(inputElement) {
        inputElement.classList.remove("invalid");
        const errorSpan = document.getElementById(`${inputElement.id}Error`);
        if (errorSpan) errorSpan.textContent = "";
    }

    /* --- Core Business Logic --- */

    validateAndNext() {
        const name = this.DOM.inputs.name.value.trim();
        const roll = this.DOM.inputs.roll.value.trim();
        const studentClass = this.DOM.inputs.class.value.trim();

        let isValid = true;

        if (!name) { this.showError(this.DOM.inputs.name, "Name is required"); isValid = false; }
        if (!roll) { this.showError(this.DOM.inputs.roll, "Roll number is required"); isValid = false; }
        if (!studentClass) { this.showError(this.DOM.inputs.class, "Class is required"); isValid = false; }

        if (isValid) {
            this.state.user = { name, roll, class: studentClass };
            this.showPage("subjectPage");
            // Clear any lingering errors just in case
            Object.values(this.DOM.inputs).forEach(input => this.clearError(input));
        } else {
            this.showToast("Please fill in all required fields", "error");
        }
    }

    startQuiz() {
        const selectedRadio = document.querySelector('input[name="subject"]:checked');

        if (!selectedRadio) {
            this.showToast("Please select an assessment topic", "error");
            return;
        }

        const subjectId = selectedRadio.value;
        const subjectCard = selectedRadio.closest('.subject-card');
        const subjectName = subjectCard.querySelector('h3').textContent;

        this.state.quiz.subjectId = subjectId;
        this.state.quiz.subjectName = subjectName;
        this.state.quiz.questions = quizData[subjectId];
        this.state.quiz.timeLeft = this.state.quiz.totalTime;

        this.DOM.quiz.title.textContent = `${subjectName} Assessment`;
        this.DOM.quiz.badge.textContent = subjectId.toUpperCase();

        this.renderQuestions();
        this.updateProgress();
        this.showPage("quizPage");
        this.startTimer();
    }

    renderQuestions() {
        this.DOM.quiz.form.innerHTML = "";

        this.state.quiz.questions.forEach((q, index) => {
            const block = document.createElement("div");
            block.className = "question-block";

            const qText = document.createElement("div");
            qText.className = "question-text";
            qText.innerHTML = `<span style="color: var(--primary-color); margin-right: 8px;">${index + 1}.</span> ${q.q}`;
            block.appendChild(qText);

            const optionsWrapper = document.createElement("div");
            optionsWrapper.className = "options-wrapper";

            q.options.forEach(opt => {
                const label = document.createElement("label");
                label.className = "option-label";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = `q${index}`;
                input.value = opt;

                // Add event listener to visually highlight selected option and update progress
                input.addEventListener('change', (e) => {
                    // Remove 'selected' class from all siblings
                    const allLabels = optionsWrapper.querySelectorAll('.option-label');
                    allLabels.forEach(l => l.classList.remove('selected'));

                    // Add 'selected' to current
                    if (e.target.checked) label.classList.add('selected');

                    this.updateProgress();
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(opt));
                optionsWrapper.appendChild(label);
            });

            block.appendChild(optionsWrapper);
            this.DOM.quiz.form.appendChild(block);
        });
    }

    updateProgress() {
        const total = this.state.quiz.questions.length;
        let answered = 0;

        for (let i = 0; i < total; i++) {
            if (this.DOM.quiz.form.querySelector(`input[name="q${i}"]:checked`)) {
                answered++;
            }
        }

        const percentage = Math.round((answered / total) * 100);

        this.DOM.quiz.progressBar.style.width = `${percentage}%`;
        this.DOM.quiz.progressText.textContent = `Question ${answered} of ${total} answered`;
        this.DOM.quiz.progressPercent.textContent = `${percentage}%`;
    }

    startTimer() {
        if (this.state.quiz.timerInterval) clearInterval(this.state.quiz.timerInterval);

        this.renderTimerDisplay();
        this.DOM.quiz.timerContainer.classList.remove("warning");

        this.state.quiz.timerInterval = setInterval(() => {
            this.state.quiz.timeLeft--;
            this.renderTimerDisplay();

            if (this.state.quiz.timeLeft <= 0) {
                clearInterval(this.state.quiz.timerInterval);
                this.showToast("Time is up! Auto-submitting...", "error");
                this.submitQuiz(true); // true flags it's an auto-submit
            }
        }, 1000);
    }

    renderTimerDisplay() {
        const minutes = Math.floor(this.state.quiz.timeLeft / 60);
        const seconds = this.state.quiz.timeLeft % 60;

        this.DOM.quiz.timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Add visual warning when under 1 minute
        if (this.state.quiz.timeLeft <= 60 && this.state.quiz.timeLeft > 0) {
            if (!this.DOM.quiz.timerContainer.classList.contains("warning")) {
                this.DOM.quiz.timerContainer.classList.add("warning");
                this.showToast("Less than 1 minute remaining!", "error");
            }
        }
    }

    confirmSubmit() {
        const total = this.state.quiz.questions.length;
        let answered = 0;

        for (let i = 0; i < total; i++) {
            if (this.DOM.quiz.form.querySelector(`input[name="q${i}"]:checked`)) {
                answered++;
            }
        }

        if (answered < total) {
            // Can use sweetalert here instead if imported, but native confirm as fallback for now
            const proceed = confirm(`You have only answered ${answered} out of ${total} questions. Are you sure you want to submit?`);
            if (!proceed) return;
        }

        this.submitQuiz();
    }

    submitQuiz(isAutoSubmit = false) {
        clearInterval(this.state.quiz.timerInterval);

        let score = 0;
        let reviewHTML = "";

        this.state.quiz.questions.forEach((q, index) => {
            const selectedInput = this.DOM.quiz.form.querySelector(`input[name="q${index}"]:checked`);
            const userAnswer = selectedInput ? selectedInput.value : null;

            const isCorrect = userAnswer === q.ans;
            if (isCorrect) score++;

            // Create Icon based on correctness
            const iconSvg = isCorrect
                ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success-color)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
                : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--danger-color)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

            reviewHTML += `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-qtext" style="display:flex; justify-content:space-between; gap:10px;">
                        <span>${index + 1}. ${q.q}</span>
                        ${iconSvg}
                    </div>
                    <div class="review-ans user-ans ${isCorrect ? '' : 'incorrect'}">
                        <strong>Your Answer:</strong> <span>${userAnswer || 'Not Answered'}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="review-ans correct-ans">
                        <strong>Correct Answer:</strong> <span>${q.ans}</span>
                    </div>` : ''}
                </div>
            `;
        });

        this.state.quiz.score = score;
        const total = this.state.quiz.questions.length;
        const percentage = Math.round((score / total) * 100);

        this.buildResultView(score, total, percentage, reviewHTML);

        if (!isAutoSubmit) {
            this.showToast(percentage >= 80 ? "Outstanding performance!" : "Assessment submitted successfully", "success");
        }
    }

    buildResultView(score, total, percentage, reviewHTML) {
        // Animate circular chart on load
        // Reset path first
        this.DOM.result.scorePath.setAttribute('stroke-dasharray', `0, 100`);
        this.DOM.result.scoreText.textContent = "0%";

        // Define color based on score
        let strokeColor = "var(--primary-color)";
        if (percentage >= 80) strokeColor = "var(--success-color)";
        else if (percentage < 50) strokeColor = "var(--danger-color)";
        else if (percentage < 80) strokeColor = "var(--warning-color)";

        this.DOM.result.scorePath.style.stroke = strokeColor;
        this.DOM.result.scoreText.style.fill = strokeColor;

        if (percentage >= 80) {
            this.DOM.result.greeting.textContent = "Exceptional Work!";
        } else if (percentage >= 50) {
            this.DOM.result.greeting.textContent = "Good Effort!";
        } else {
            this.DOM.result.greeting.textContent = "Needs Improvement";
        }

        // Build summary grid
        this.DOM.result.info.innerHTML = `
            <div class="result-row"><span>Candidate</span> <strong>${this.state.user.name}</strong></div>
            <div class="result-row"><span>Roll Number</span> <strong>${this.state.user.roll}</strong></div>
            <div class="result-row"><span>Class Track</span> <strong>${this.state.user.class}</strong></div>
            <div class="result-row"><span>Assessment Area</span> <strong>${this.state.quiz.subjectName}</strong></div>
            <div class="result-row full-width">
                <span>Total Score Achieved</span> 
                <strong style="color: ${strokeColor}">${score} / ${total} correctly answered</strong>
            </div>
        `;

        this.DOM.result.container.innerHTML = reviewHTML;

        this.showPage("resultPage");

        // Trigger animation safely after page render block
        setTimeout(() => {
            this.DOM.result.scorePath.setAttribute('stroke-dasharray', `${percentage}, 100`);
            // Value counter animation
            this.animateValue(this.DOM.result.scoreText, 0, percentage, 1500);
        }, 300);
    }

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    restartQuiz() {
        this.state.quiz.score = 0;

        // Clear radios visually in DOM
        const radios = document.querySelectorAll('input[name="subject"]');
        radios.forEach(r => r.checked = false);

        this.showPage("subjectPage");
        window.scrollTo(0, 0);
    }

    downloadPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const { name, roll, class: studentClass } = this.state.user;
            const { subjectName, score, questions } = this.state.quiz;
            const total = questions.length;
            const percentage = Math.round((score / total) * 100);

            // PDF Header Professional Look
            doc.setFillColor(37, 99, 235); // var(--primary-color)
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("Professional Assessment Report", 20, 25);

            // Sub/meta block
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            doc.text("CANDIDATE DETAILS", 20, 55);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 57, 190, 57);

            doc.setFont("helvetica", "bold");
            doc.text(`Name:`, 20, 65); doc.setFont("helvetica", "normal"); doc.text(name, 40, 65);
            doc.setFont("helvetica", "bold");
            doc.text(`Roll No:`, 20, 72); doc.setFont("helvetica", "normal"); doc.text(roll, 40, 72);
            doc.setFont("helvetica", "bold");
            doc.text(`Class:`, 20, 79); doc.setFont("helvetica", "normal"); doc.text(studentClass, 40, 79);

            doc.setFont("helvetica", "bold");
            doc.text(`Assessment:`, 110, 65); doc.setFont("helvetica", "normal"); doc.text(subjectName, 140, 65);
            doc.setFont("helvetica", "bold");
            doc.text(`Date completed:`, 110, 72); doc.setFont("helvetica", "normal"); doc.text(new Date().toLocaleDateString(), 145, 72);

            // Score box
            doc.setFillColor(248, 250, 252); // var(--secondary-color)
            doc.setDrawColor(226, 232, 240); // border-color
            doc.rect(20, 90, 170, 30, 'FD');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            if (percentage >= 80) doc.setTextColor(5, 150, 105);
            else if (percentage >= 50) doc.setTextColor(217, 119, 6);
            else doc.setTextColor(225, 29, 72);

            doc.text(`Final Score: ${score} out of ${total} (${percentage}%)`, 30, 108);
            doc.setTextColor(50, 50, 50);

            // Review Section (if errors)
            if (score < total) {
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Review of Incorrect Responses", 20, 140);
                doc.line(20, 142, 190, 142);

                let yPos = 155;

                questions.forEach((q, index) => {
                    const selectedInput = this.DOM.quiz.form.querySelector(`input[name="q${index}"]:checked`);
                    const pAns = selectedInput ? selectedInput.value : null;

                    if (pAns !== q.ans) {
                        if (yPos > 260) { // Page wrap logic
                            doc.addPage();
                            yPos = 20;
                        }

                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                        doc.setTextColor(30, 41, 59); // var(--text-main)

                        // Handle long text wrapping
                        const splitTitle = doc.splitTextToSize(`Q${index + 1}: ${q.q}`, 170);
                        doc.text(splitTitle, 20, yPos);
                        yPos += (7 * splitTitle.length);

                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(225, 29, 72); // Danger Red
                        doc.text(`Provided Answer: ${pAns || 'Left Blank'}`, 25, yPos);
                        yPos += 7;

                        doc.setTextColor(5, 150, 105); // Success Green
                        doc.text(`Correct Answer: ${q.ans}`, 25, yPos);
                        yPos += 14;
                    }
                });
            } else {
                doc.setFontSize(14);
                doc.setTextColor(5, 150, 105);
                doc.text("Perfect Assessment! No incorrect answers to review.", 20, 140);
            }

            doc.save(`Assessment_${name.replace(/\s+/g, '_')}_${subjectName.replace(/\s+/g, '_')}.pdf`);
            this.showToast("Report downloaded successfully", "success");

        } catch (e) {
            console.error(e);
            this.showToast("Failed to generate PDF. Make sure jsPDF is loaded.", "error");
        }
    }
}

// Instantiate App globally for inline onclick references
const app = new QuizApp();
