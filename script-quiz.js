document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const quizImage = document.getElementById('quiz-image');
    const answersContainer = document.getElementById('answers-container');
    const feedbackMessage = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const quizScoreDisplay = document.getElementById('quiz-score');

    // Kvízové otázky
    // Každá otázka má: obrázek, text otázky, pole tří možností a index správné odpovědi (0, 1 nebo 2)
    const quizQuestions = [
        {
            image: 'images/puzzle1.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzové dláto',
                'Bronzová sekera'
            ],
            correctAnswer: 1 // Index 0 odpovídá první možnosti
        },
        {
            image: 'images/puzzle2.jpg',
            question: 'K čemu sloužil tento předmět?',
            options: [
                'Ke sklízení obilí',
                'Ke krájení masa'
            ],
            correctAnswer: 0
        },
        {
            image: 'images/puzzle3.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzová růžicová spona',
                'Část bronzového opasku'
            ],
            correctAnswer: 0
        }
        // Zde můžete přidat další otázky
        // Příklad další otázky:
        /*
        {
            image: 'images/puzzle4.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzová břitva',
                'Bronzový závěsek'
            ],
            correctAnswer: 1
        }
        */
    ];

    let shuffledQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // Funkce pro zamíchání otázek
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Funkce pro načtení a zobrazení otázky
    function loadQuestion() {
        if (currentQuestionIndex >= shuffledQuestions.length) {
            displayFinalScore();
            return;
        }

        const currentQuestion = shuffledQuestions[currentQuestionIndex];

        questionText.textContent = currentQuestion.question;
        quizImage.src = currentQuestion.image;
        feedbackMessage.textContent = '';
        nextButton.classList.add('hidden'); // Skryje tlačítko "Další otázka"

        answersContainer.innerHTML = ''; // Vyčistí předchozí tlačítka

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('answer-button');
            button.addEventListener('click', () => checkAnswer(index, button));
            answersContainer.appendChild(button);
        });
    }

    // Funkce pro kontrolu odpovědi
    function checkAnswer(selectedIndex, clickedButton) {
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        const allAnswerButtons = answersContainer.querySelectorAll('.answer-button');

        // Zablokovat všechna tlačítka po odpovědi
        allAnswerButtons.forEach(button => {
            button.disabled = true;
        });

        if (selectedIndex === currentQuestion.correctAnswer) {
            score++;
            clickedButton.classList.add('correct');
            feedbackMessage.textContent = 'Správně!';
            feedbackMessage.style.color = 'green';
        } else {
            clickedButton.classList.add('wrong');
            feedbackMessage.textContent = 'Špatně. Správná odpověď byla: ' + currentQuestion.options[currentQuestion.correctAnswer];
            feedbackMessage.style.color = 'red';
            // Zvýraznění správné odpovědi, pokud byla vybrána špatná
            allAnswerButtons[currentQuestion.correctAnswer].classList.add('correct');
        }

        nextButton.classList.remove('hidden'); // Zobrazí tlačítko "Další otázka"
    }

    // Funkce pro zobrazení finálního skóre
    function displayFinalScore() {
        questionText.textContent = 'Kvíz dokončen!';
        quizImage.classList.add('hidden'); // Skryje obrázek
        answersContainer.innerHTML = ''; // Vyčistí tlačítka
        feedbackMessage.textContent = '';
        nextButton.classList.add('hidden');
        quizScoreDisplay.classList.remove('hidden');
        quizScoreDisplay.textContent = `Vaše skóre: ${score} z ${shuffledQuestions.length}`;
    }

    // Event listener pro tlačítko "Další otázka"
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });

    // Inicializace kvízu při načtení stránky
    shuffleArray(quizQuestions); // Zamícháme otázky
    shuffledQuestions = quizQuestions; // Uložíme zamíchané otázky
    loadQuestion(); // Načteme první otázku
});