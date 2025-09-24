document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const quizImage = document.getElementById('quiz-image');
    const answersContainer = document.getElementById('answers-container');
    const feedbackMessage = document.getElementById('feedback');
    const nextButton = document.getElementById('next-button');
    const quizScoreDisplay = document.getElementById('quiz-score');
    const imageContainer = document.querySelector('.image-container'); // NOVINKA: Získáme referenci na image-container

    // Kvízové otázky
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
                'K porcování masa'
            ],
            correctAnswer: 0
        },
        {
            image: 'images/puzzle11.jpg',
            question: 'Odkud může pocházet surovina (jantar) použitá k výrobě tohoto předmtěu?',
            options: [
                'Z oblasti Středomoří',
                'Z oblasti Baltu'
            ],
            correctAnswer: 1
        },
        {
            image: 'images/puzzle3.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzová růžicová spona',
                'Část bronzového opasku'
            ],
            correctAnswer: 0
        },
        {
            image: 'images/puzzle10.jpg',
            question: 'K čemu sloužil předmět na obrázku?',
            options: [
                'K odlévání bronzových předmětů',
                'K broušení bronzových předmětů'
            ],
            correctAnswer: 0
        },
        {
            // Další textová otázka
            question: 'Jak se jinak říká hromadným nálezům/pokladům?',
            options: [
                'Despoty',
                'Depoty',
                'Deploty'
            ],
            correctAnswer: 1
        },
        {
            // Další textová otázka
            question: 'Do jakého období přibližně můžeme zařadit mladší a pozdní dobu bronzovou?',
            options: [
                '750 - 400 př. n. l.',
                '2200 - 1300 př. n. l.',
                '1300 - 750 př. n. l.'
            ],
            correctAnswer: 2
        },
        {
            // Další textová otázka
            question: 'Na co odkazuje slovo "popelnice" z pojmenování Kultura lužických popelnicových polí?',
            options: [
                'Odpadní jáma',
                'Odpadní nádoba',
                'Pohřební nádoba'
            ],
            correctAnswer: 2
        },
        {
            image: 'images/puzzle4.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzová břitva',
                'Bronzový závěsek'
            ],
            correctAnswer: 1
        },
        {
            image: 'images/puzzle17.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Rukojeť meče',
                'Závěsek'
            ],
            correctAnswer: 0
        },
        {
            image: 'images/puzzle19.jpg',
            question: 'Jaký artefakt je zobrazen na obrázku?',
            options: [
                'Bronzové kopí',
                'Bronzové dláto'
            ],
            correctAnswer: 1
        },
        {
            // Další textová otázka
            question: 'Co je to bronz?',
            options: [
                'Slitina mědi a zinku',
                'Slitina mědi a niklu',
                'Slitina mědi a cínu'
            ],
            correctAnswer: 2
        },
        {
            // Další textová otázka
            question: 'Jaký byl nejběžnější typ pohřbu během mladší a pozdní doby bronzové',
            options: [
                'Kostrový',
                'Žárový'
            ],
            correctAnswer: 1
        },
        {
            // Další textová otázka
            question: 'Jakou archeologickou kulturu je možné zařadit do mladší doby bronzové?',
            options: [
                'Středodunajská mohylová kultura',
                'Kultura lužických popelnicových polí',
                'Laténská kultura'
            ],
            correctAnswer: 1
        }
        // Zde můžete přidat další otázky
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
        feedbackMessage.textContent = '';
        nextButton.classList.add('hidden');

        // NOVINKA: Kontrola, zda otázka obsahuje obrázek
        if (currentQuestion.image) {
            quizImage.src = currentQuestion.image;
            imageContainer.classList.remove('hidden'); // Zobrazit kontejner s obrázkem
        } else {
            imageContainer.classList.add('hidden'); // Skrýt kontejner s obrázkem
            quizImage.src = ''; // Vyprázdnit src, aby se nic nenačítalo
        }


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
        imageContainer.classList.add('hidden'); // Skryje obrázek i jeho kontejner
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




