document.addEventListener('DOMContentLoaded', () => {
    const puzzleContainer = document.getElementById('puzzle-container');
    const shuffleButton = document.getElementById('shuffle-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const puzzleInfo = document.getElementById('puzzle-info');
    const messageDisplay = document.getElementById('message');

    // Nastavení puzzle - počet řádků a sloupců je zatím pevný
    const numRows = 3; // Počet řádků
    const numCols = 3; // Počet sloupců
    
    let dynamicTotalPuzzleWidth;  // Celková šířka puzzle kontejneru
    let dynamicTotalPuzzleHeight; // Celková výška puzzle kontejneru

    // Seznam obrázků puzzle
    const puzzleImages = [
        'images/puzzle1.jpg',
        'images/puzzle2.jpg',
        'images/puzzle3.jpg'
        // Přidejte další obrázky podle potřeby
    ];

    // NOVĚ: Objekt s texty pro jednotlivé obrázky puzzle
    const puzzleMessages = {
        'images/puzzle1.jpg': 'Bronzová sekera s tulejí a ouškem, délka 11,2 cm. Kultura lužických popelnicových polí.',
        'images/puzzle2.jpg': 'Bronzový srp, délka 11.7 cm.',
        'images/puzzle3.jpg': 'Růžicová spona o rozměrech 34,7 x 19 cm. Kultura lužických popelnicových polí'
        // Přidejte další texty pro vaše obrázky
    };


    let currentPuzzleIndex = 0;

    let pieces = [];
    let currentPositions = [];
    let originalPositions = [];

    let draggedPiece = null;

    // --- Funkce pro výpočet rozměrů puzzle na základě velikosti okna a rozměrů obrázku ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
        const navControlsHeight = document.querySelector('.navigation-controls') ? document.querySelector('.navigation-controls').offsetHeight : 0;
        const gameControlsHeight = document.querySelector('.game-controls') ? document.querySelector('.game-controls').offsetHeight : 0;
        const backButtonHeight = document.querySelector('.back-button') ? document.querySelector('.back-button').offsetHeight : 0;
        const messageHeight = document.getElementById('message') ? document.getElementById('message').offsetHeight : 0;

        const verticalPaddingAndMargins = 20 * 2 + 20 + 20 + 30 + 20; // Přibližné celkové vertikální mezery

        const maxAvailableWidth = viewportWidth * 0.9;
        const maxAvailableHeight = viewportHeight - (headerHeight + navControlsHeight + gameControlsHeight + backButtonHeight + messageHeight + verticalPaddingAndMargins);

        let targetWidth;
        let targetHeight;

        const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
        const containerAspectRatio = maxAvailableWidth / maxAvailableHeight;

        // Určení cílových rozměrů pro kontejner puzzle s ohledem na poměr stran obrázku a dostupné místo
        if (imageAspectRatio > containerAspectRatio) {
            targetWidth = maxAvailableWidth;
            targetHeight = maxAvailableWidth / imageAspectRatio;
        } else {
            targetHeight = maxAvailableHeight;
            targetWidth = maxAvailableHeight * imageAspectRatio;
        }

        // Zajištění minimální velikosti puzzle
        targetWidth = Math.max(targetWidth, 200);
        targetHeight = Math.max(targetHeight, 200);

        // Znovu kontrola, zda se po omezení minimální velikostí stále vejde do maxAvailableWidth/Height
        if (targetWidth > maxAvailableWidth) {
            targetWidth = maxAvailableWidth;
            targetHeight = maxAvailableWidth / imageAspectRatio;
        }
        if (targetHeight > maxAvailableHeight) {
            targetHeight = maxAvailableHeight;
            targetWidth = maxAvailableHeight * imageAspectRatio;
        }

        dynamicTotalPuzzleWidth = targetWidth;
        dynamicTotalPuzzleHeight = targetHeight;

        // Nastavíme rozměry kontejneru
        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;

        // Vypočítáme přesné (desetinné) rozměry jednoho dílku
        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        // Nastavíme grid template v CSS proměnných pomocí přesných rozměrů dílků
        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

        // Nastavíme CSS proměnné pro background-size dílků (celková velikost obrázku)
        puzzleContainer.style.setProperty('--puzzle-total-width', `${dynamicTotalPuzzleWidth}px`);
        puzzleContainer.style.setProperty('--puzzle-total-height', `${dynamicTotalPuzzleHeight}px`);
    }

    // --- Funkce pro načtení a inicializaci puzzle ---
    function loadPuzzle(index) {
        if (index < 0 || index >= puzzleImages.length) {
            console.error('Neplatný index puzzle obrázku.');
            return;
        }

        currentPuzzleIndex = index;
        const imageUrl = puzzleImages[currentPuzzleIndex];
        puzzleInfo.textContent = `Puzzle ${currentPuzzleIndex + 1} / ${puzzleImages.length}`;
        messageDisplay.textContent = ''; // Vymaže zprávu při načtení nového puzzle

        const img = new Image();
        img.onload = () => {
            calculatePuzzleDimensions(img.naturalWidth, img.naturalHeight);
            initializePuzzle(imageUrl);

            prevButton.disabled = (currentPuzzleIndex === 0);
            nextButton.disabled = (currentPuzzleIndex === puzzleImages.length - 1);
            shuffleButton.disabled = false;
        };
        img.onerror = () => {
            console.error(`Nepodařilo se načíst obrázek: ${imageUrl}`);
            messageDisplay.textContent = 'Chyba při načítání obrázku.';
            puzzleContainer.innerHTML = '';
            prevButton.disabled = true;
            nextButton.disabled = true;
            shuffleButton.disabled = true;
        };
        img.src = imageUrl;
    }

    // --- Funkce pro inicializaci dílků puzzle ---
    function initializePuzzle(imageDataUrl) {
        puzzleContainer.innerHTML = '';
        pieces = [];
        currentPositions = [];
        originalPositions = [];
        
        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        for (let i = 0; i < numRows * numCols; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${imageDataUrl})`;

            const row = Math.floor(i / numCols);
            const col = i % numCols;
            
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            
            piece.dataset.originalIndex = i;
            piece.draggable = true;

            pieces.push(piece);
            currentPositions.push(i);
            originalPositions.push(i);

            puzzleContainer.appendChild(piece);
        }

        addEventListenersToPieces();
        positionPieces();
        shufflePieces(); // Při inicializaci se rovnou zamíchá
    }

    // --- Funkce pro umístění dílků v gridu ---
    function positionPieces() {
        pieces.forEach((piece, index) => {
            const targetIndex = currentPositions[index];
            const row = Math.floor(targetIndex / numCols);
            const col = targetIndex % numCols;
            piece.style.gridRowStart = row + 1;
            piece.style.gridColumnStart = col + 1;
        });
    }

    // --- Funkce pro zamíchání dílků ---
    function shufflePieces() {
        messageDisplay.textContent = ''; // Vymaže zprávu při zamíchání
        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
        }
        positionPieces();
        checkWin();
    }

    // --- Funkce pro přidání event listenerů pro přetahování ---
    function addEventListenersToPieces() {
        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedPiece = piece;
                e.dataTransfer.effectAllowed = 'move';
                piece.classList.add('dragging');
            });

            piece.addEventListener('dragend', () => {
                if (draggedPiece) {
                    draggedPiece.classList.remove('dragging');
                    draggedPiece = null;
                }
            });

            piece.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            piece.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPiece && draggedPiece !== piece) {
                    const draggedIndexInPiecesArray = pieces.indexOf(draggedPiece);
                    const targetIndexInPiecesArray = pieces.indexOf(piece);

                    const tempCurrentPositionOfDragged = currentPositions[draggedIndexInPiecesArray];
                    currentPositions[draggedIndexInPiecesArray] = currentPositions[targetIndexInPiecesArray];
                    currentPositions[targetIndexInPiecesArray] = tempCurrentPositionOfDragged;

                    positionPieces();
                    checkWin();
                }
            });
        });
    }

    // --- Funkce pro kontrolu výhry ---
    function checkWin() {
        let isSolved = true;
        for (let i = 0; i < numRows * numCols; i++) {
            if (parseInt(pieces[i].dataset.originalIndex) !== currentPositions[i]) {
                isSolved = false;
                break;
            }
        }

        if (isSolved) {
            // NOVĚ: Zobrazí text specifický pro složené puzzle
            const currentImageUrl = puzzleImages[currentPuzzleIndex];
            messageDisplay.textContent = puzzleMessages[currentImageUrl] || 'Gratulujeme! Puzzle složeno!'; // Fallback zpráva
            pieces.forEach(piece => piece.classList.add('correct'));
            shuffleButton.disabled = true;
        } else {
            messageDisplay.textContent = '';
            pieces.forEach(piece => piece.classList.remove('correct'));
            if (pieces.length > 0) {
                prevButton.disabled = (currentPuzzleIndex === 0);
                nextButton.disabled = (currentPuzzleIndex === puzzleImages.length - 1);
                shuffleButton.disabled = false;
            }
        }
    }

    // --- Event Listenery pro tlačítka navigace ---
    prevButton.addEventListener('click', () => {
        if (currentPuzzleIndex > 0) {
            loadPuzzle(currentPuzzleIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPuzzleIndex < puzzleImages.length - 1) {
            loadPuzzle(currentPuzzleIndex + 1);
        }
    });

    // --- Event Listener pro tlačítko "Zamíchat" ---
    shuffleButton.addEventListener('click', shufflePieces);

    // --- Načtení prvního puzzle při načtení stránky ---
    if (puzzleImages.length > 0) {
        loadPuzzle(0); // Načte první puzzle
    } else {
        messageDisplay.textContent = 'Nebyly nalezeny žádné puzzle obrázky. Zkontrolujte pole puzzleImages v script-puzzle.js.';
        shuffleButton.disabled = true;
        prevButton.disabled = true;
        nextButton.disabled = true;
    }

    // --- Event Listener pro změnu velikosti okna (responzivita) ---
    window.addEventListener('resize', () => {
        loadPuzzle(currentPuzzleIndex);
    });
});