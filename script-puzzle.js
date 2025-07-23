document.addEventListener('DOMContentLoaded', () => {
    const puzzleContainer = document.getElementById('puzzle-container');
    const shuffleButton = document.getElementById('shuffle-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const puzzleInfo = document.getElementById('puzzle-info');
    const messageDisplay = document.getElementById('message');

    const numRows = 3;
    const numCols = 3;
    
    let dynamicTotalPuzzleWidth;
    let dynamicTotalPuzzleHeight;

    const puzzleImages = [
        'images/puzzle1.jpg',
        'images/puzzle2.jpg',
        'images/puzzle3.jpg'
    ];

    const puzzleMessages = {
        'images/puzzle1.jpg': 'Bronzová sekera s tulejí a ouškem, délka 11,2 cm. Kultura lužických popelnicových polí.',
        'images/puzzle2.jpg': 'Dřevěná nádoba s rytým zdobením, výška 25 cm. Nález z raně středověkého hradiště.',
        'images/puzzle3.jpg': 'Fragment keramiky s otiskem textilie. Doba bronzová, sídliště z pozdní doby kamenné.'
    };

    let currentPuzzleIndex = 0;
    let pieces = [];
    let currentPositions = [];
    let originalPositions = [];

    let draggedPiece = null;
    let highlightedPiece = null; // NOVÁ PROMĚNNÁ pro sledování zvýrazněného dílku

    // --- Funkce pro výpočet rozměrů puzzle na základě velikosti okna a rozměrů obrázku ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
        const navControlsHeight = document.querySelector('.navigation-controls') ? document.querySelector('.navigation-controls').offsetHeight : 0;
        const gameControlsHeight = document.querySelector('.game-controls') ? document.querySelector('.game-controls').offsetHeight : 0;
        const backButtonHeight = document.querySelector('.back-button') ? document.querySelector('.back-button').offsetHeight : 0;
        const messageHeight = document.getElementById('message') ? document.getElementById('message').offsetHeight : 0;

        const verticalPaddingAndMargins = 20 * 2 + 20 + 20 + 30 + 20;

        const maxAvailableWidth = viewportWidth * 0.9;
        const maxAvailableHeight = viewportHeight - (headerHeight + navControlsHeight + gameControlsHeight + backButtonHeight + messageHeight + verticalPaddingAndMargins);

        let targetWidth;
        let targetHeight;

        const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
        const containerAspectRatio = maxAvailableWidth / maxAvailableHeight;

        if (imageAspectRatio > containerAspectRatio) {
            targetWidth = maxAvailableWidth;
            targetHeight = maxAvailableWidth / imageAspectRatio;
        } else {
            targetHeight = maxAvailableHeight;
            targetWidth = maxAvailableHeight * imageAspectRatio;
        }

        targetWidth = Math.max(targetWidth, 200);
        targetHeight = Math.max(targetHeight, 200);

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

        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;

        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

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
        messageDisplay.textContent = '';

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
        shufflePieces();
    }

    // --- Funkce pro umístění dílků v gridu ---
    function positionPieces() {
        pieces.forEach((piece, index) => {
            const targetIndex = currentPositions[index];
            const row = Math.floor(targetIndex / numCols);
            const col = targetIndex % numCols;
            piece.style.gridRowStart = row + 1;
            piece.style.gridColumnStart = col + 1;
            // Zajistí, že se styly z dotykového přetahování resetují, pokud by z nějakého důvodu zůstaly
            piece.style.removeProperty('transform'); 
            piece.style.removeProperty('left');
            piece.style.removeProperty('top');
            piece.style.removeProperty('z-index');
        });
    }

    // --- Funkce pro zamíchání dílků ---
    function shufflePieces() {
        messageDisplay.textContent = '';
        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
        }
        positionPieces();
        checkWin();
    }

    // --- Funkce pro přidání event listenerů pro přetahování (myš i dotyk) ---
    function addEventListenersToPieces() {
        pieces.forEach(piece => {
            // --- Myší události (zachovány pro desktop) ---
            piece.addEventListener('dragstart', (e) => {
                draggedPiece = piece;
                e.dataTransfer.effectAllowed = 'move';
                piece.classList.add('dragging');
                const rect = piece.getBoundingClientRect();
                draggedPiece.style.left = `${e.clientX}px`;
                draggedPiece.style.top = `${e.clientY}px`;
            });

            piece.addEventListener('dragend', () => {
                if (draggedPiece) {
                    draggedPiece.classList.remove('dragging');
                    draggedPiece.style.transform = '';
                    draggedPiece.style.removeProperty('left');
                    draggedPiece.style.removeProperty('top');
                    draggedPiece = null;
                    positionPieces();
                    checkWin();
                }
            });

            piece.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedPiece) {
                    draggedPiece.style.left = `${e.clientX}px`;
                    draggedPiece.style.top = `${e.clientY}px`;

                    // Zvýraznění cílového dílku během dragover
                    let elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
                    if (highlightedPiece && highlightedPiece !== elementUnderCursor) {
                        highlightedPiece.classList.remove('highlight');
                    }
                    if (elementUnderCursor && elementUnderCursor.classList.contains('puzzle-piece') && elementUnderCursor !== draggedPiece) {
                        elementUnderCursor.classList.add('highlight');
                        highlightedPiece = elementUnderCursor;
                    } else {
                        highlightedPiece = null;
                    }
                }
            });

            piece.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPiece && draggedPiece !== piece) {
                    const draggedIndexInPiecesArray = pieces.indexOf(draggedPiece);
                    const targetIndexInPiecesArray = pieces.indexOf(piece);

                    const tempCurrentPositionOfDragged = currentPositions[draggedIndexInPiecesArray];
                    currentPositions[draggedIndexInPiecesArray] = currentPositions[targetIndexInPiecesArray];
                    currentPositions[targetIndexInPiecesArray] = tempCurrentPositionOfDragged;
                }
                // positionPieces() a checkWin() se volají v dragend
            });

            // --- Dotykové události (pro mobilní zařízení/tablety) ---
            piece.addEventListener('touchstart', (e) => {
                e.preventDefault();

                draggedPiece = piece;
                draggedPiece.classList.add('dragging');

                const touch = e.touches[0];
                draggedPiece.style.left = `${touch.clientX}px`;
                draggedPiece.style.top = `${touch.clientY}px`;
            });

            piece.addEventListener('touchmove', (e) => {
                if (!draggedPiece) return;
                e.preventDefault(); 

                const touch = e.touches[0];
                draggedPiece.style.left = `${touch.clientX}px`;
                draggedPiece.style.top = `${touch.clientY}px`;

                // --- NOVÁ LOGIKA PRO ZVÝRAZNĚNÍ CÍLE BĚHEM PŘETAHOVÁNÍ ---
                // Dočasně skryjeme tažený dílek, abychom našli element pod ním
                draggedPiece.style.visibility = 'hidden';
                let elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
                draggedPiece.style.visibility = 'visible';

                // Zruší zvýraznění předchozího dílku
                if (highlightedPiece && highlightedPiece !== elementUnderFinger) {
                    highlightedPiece.classList.remove('highlight');
                }

                // Zvýrazní nový cílový dílek, pokud je to puzzle-piece a není to tažený dílek
                if (elementUnderFinger && elementUnderFinger.classList.contains('puzzle-piece') && elementUnderFinger !== draggedPiece) {
                    elementUnderFinger.classList.add('highlight');
                    highlightedPiece = elementUnderFinger;
                } else {
                    highlightedPiece = null; // Pokud není pod prstem žádný platný dílek
                }
                // --- KONEC NOVÉ LOGIKY ---
            });

            piece.addEventListener('touchend', (e) => {
                if (!draggedPiece) return;

                // Vyčistí zvýraznění při ukončení přetahování
                if (highlightedPiece) {
                    highlightedPiece.classList.remove('highlight');
                    highlightedPiece = null;
                }

                // Dočasně skryjeme tažený dílek, abychom našli element pod ním
                draggedPiece.style.visibility = 'hidden';
                const touch = e.changedTouches[0];
                let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
                draggedPiece.style.visibility = 'visible';

                // Pokud existuje cílový element a je to jiný dílek puzzle
                if (targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== draggedPiece) {
                    const draggedIndexInPiecesArray = pieces.indexOf(draggedPiece);
                    const targetIndexInPiecesArray = pieces.indexOf(targetElement);

                    const tempCurrentPositionOfDragged = currentPositions[draggedIndexInPiecesArray];
                    currentPositions[draggedIndexInPiecesArray] = currentPositions[targetIndexInPiecesArray];
                    currentPositions[targetIndexInPiecesArray] = tempCurrentPositionOfDragged;
                }

                // Resetujeme styly taženého dílku
                draggedPiece.classList.remove('dragging');
                draggedPiece.style.removeProperty('left');
                draggedPiece.style.removeProperty('top');
                draggedPiece.style.removeProperty('transform');
                
                draggedPiece = null;

                positionPieces();
                checkWin();
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
            const currentImageUrl = puzzleImages[currentPuzzleIndex];
            messageDisplay.textContent = puzzleMessages[currentImageUrl] || 'Gratulujeme! Puzzle složeno!';
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
        loadPuzzle(0);
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
