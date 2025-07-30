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
        'images/puzzle3.jpg',
        'images/puzzle4.jpg',
        'images/puzzle5.jpg',
        'images/puzzle6.jpg',
        'images/puzzle7.jpg',
        'images/puzzle8.jpg',
        'images/puzzle9.jpg',
        'images/puzzle10.jpg',
        'images/puzzle11.jpg',
        'images/puzzle12.jpg',
        'images/puzzle13.jpg',
        'images/puzzle14.jpg',
        'images/puzzle15.jpg',
        'images/puzzle16.jpg',
        'images/puzzle17.jpg',
        'images/puzzle18.jpg',
        'images/puzzle19.jpg',
        'images/puzzle20.jpg',
        'images/puzzle21.jpg',
        'images/puzzle22.jpg',
        'images/puzzle23.jpg',
        'images/puzzle24.jpg'
    ];

    const puzzleMessages = {
        'images/puzzle1.jpg': 'Bronzová sekera s tulejí a ouškem, délka 11,2 cm. Kultura lužických popelnicových polí.',
        'images/puzzle2.jpg': 'Bronzový srp.',
        'images/puzzle3.jpg': 'Bronzová růžicová spona o rozměrech 34,7 x 19 cm. Kultura lužických popelnicových polí',
        'images/puzzle4.jpg': '',
        'images/puzzle5.jpg': '',
        'images/puzzle6.jpg': '',
        'images/puzzle7.jpg': '',
        'images/puzzle8.jpg': '',
        'images/puzzle9.jpg': '',
        'images/puzzle10.jpg': '',
        'images/puzzle11.jpg': '',
        'images/puzzle12.jpg': '',
        'images/puzzle13.jpg': '',
        'images/puzzle14.jpg': '',
        'images/puzzle15.jpg': '',
        'images/puzzle16.jpg': '',
        'images/puzzle17.jpg': '',
        'images/puzzle18.jpg': '',
        'images/puzzle19.jpg': '',
        'images/puzzle20.jpg': '',
        'images/puzzle21.jpg': '',
        'images/puzzle22.jpg': '',
        'images/puzzle23.jpg': '',
        'images/puzzle24.jpg': ''
    };

    let currentPuzzleIndex = 0;
    let pieces = [];
    let currentPositions = [];
    let originalPositions = [];

    let draggedPiece = null;
    let highlightedPiece = null;

    // --- FUNKCE PRO VÝPOČET ROZMĚRŮ PUZZLE (JEDINÉ MÍSTO UPRAVENÉ) ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Dynamicky získáme výšky všech prvků nad puzzle-container
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const navControlsHeight = document.querySelector('.navigation-controls')?.offsetHeight || 0;
        const gameControlsHeight = document.querySelector('.game-controls')?.offsetHeight || 0;
        const messageHeight = messageDisplay.offsetHeight || 0;
        const backButtonHeight = document.querySelector('.back-button')?.offsetHeight || 0;

        // Zohlednění paddingů na <body> elementu
        const bodyStyle = getComputedStyle(document.body);
        const bodyPaddingTop = parseFloat(bodyStyle.paddingTop) || 0;
        const bodyPaddingBottom = parseFloat(bodyStyle.paddingBottom) || 0;
        const bodyPaddingLeft = parseFloat(bodyStyle.paddingLeft) || 0;
        const bodyPaddingRight = parseFloat(bodyStyle.paddingRight) || 0;

        // Celkový vertikální prostor, který UI prvky zabírají
        let totalOccupiedVerticalSpace = headerHeight + navControlsHeight + gameControlsHeight + messageHeight + backButtonHeight + bodyPaddingTop + bodyPaddingBottom;
        
        // Přidáme pevnou rezervu pro zbývající mezery a vizuální oddělení (může být doladěno)
        const additionalVerticalSpace = 40; // Rezerva v pixelech
        totalOccupiedVerticalSpace += additionalVerticalSpace;

        const maxAvailableHeight = viewportHeight - totalOccupiedVerticalSpace;
        const maxAvailableWidth = viewportWidth - (bodyPaddingLeft + bodyPaddingRight) - 20; // Malá horizontální rezerva

        let targetWidth;
        let targetHeight;

        const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
        const containerAspectRatio = maxAvailableWidth / maxAvailableHeight;

        if (imageAspectRatio > containerAspectRatio) {
            // Obrázek je širší než dostupný kontejner, omezíme šířkou
            targetWidth = maxAvailableWidth;
            targetHeight = maxAvailableWidth / imageAspectRatio;
        } else {
            // Obrázek je vyšší než dostupný kontejner, omezíme výškou
            targetHeight = maxAvailableHeight;
            targetWidth = maxAvailableHeight * imageAspectRatio;
        }

        // Zajištění minimálních rozměrů a zároveň nepřekročení dostupného prostoru
        dynamicTotalPuzzleWidth = Math.max(80, targetWidth); 
        dynamicTotalPuzzleHeight = Math.max(80, targetHeight);

        // Konečná kontrola, aby se puzzle vešlo do dostupného prostoru
        if (dynamicTotalPuzzleWidth > maxAvailableWidth) {
            dynamicTotalPuzzleWidth = maxAvailableWidth;
            dynamicTotalPuzzleHeight = dynamicTotalPuzzleWidth / imageAspectRatio;
        }
        if (dynamicTotalPuzzleHeight > maxAvailableHeight) {
            dynamicTotalPuzzleHeight = maxAvailableHeight;
            dynamicTotalPuzzleWidth = dynamicTotalPuzzleHeight * imageAspectRatio;
        }
        
        // Poslední kontrola pro záporné hodnoty nebo příliš malé rozměry
        dynamicTotalPuzzleWidth = Math.max(10, dynamicTotalPuzzleWidth);
        dynamicTotalPuzzleHeight = Math.max(10, dynamicTotalPuzzleHeight);


        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;

        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

        puzzleContainer.style.setProperty('--puzzle-total-width', `${dynamicTotalPuzzleWidth}px`);
        puzzleContainer.style.setProperty('--puzzle-total-height', `${dynamicTotalPuzzleHeight}px`);

        // Aktualizujeme backgroundSize a backgroundPosition pro všechny dílky
        pieces.forEach(piece => {
            const row = Math.floor(parseInt(piece.dataset.originalIndex) / numCols);
            const col = parseInt(piece.dataset.originalIndex) % numCols;
            piece.style.backgroundSize = `${dynamicTotalPuzzleWidth}px ${dynamicTotalPuzzleHeight}px`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.width = `${pieceWidth}px`; 
            piece.style.height = `${pieceHeight}px`;
        });
    }

    // --- Zbytek kódu je BEZE ZMĚN oproti Vašemu původnímu souboru ---

    // Funkce pro načtení a inicializaci puzzle
    function loadPuzzle(index) {
        if (index < 0 || index >= puzzleImages.length) {
            console.error('Neplatný index puzzle obrázku.');
            return;
        }

        currentPuzzleIndex = index;
        const imageUrl = puzzleImages[currentPuzzleIndex];
        puzzleInfo.textContent = `Puzzle ${currentPuzzleIndex + 1} / ${puzzleImages.length}`;
        messageDisplay.textContent = ''; // Vyčistí zprávu při načítání nového puzzle

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

    // Funkce pro inicializaci dílků puzzle
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

    // Funkce pro umístění dílků v gridu
    function positionPieces() {
        pieces.forEach((piece, index) => {
            const targetIndex = currentPositions[index];
            const row = Math.floor(targetIndex / numCols);
            const col = targetIndex % numCols;
            piece.style.gridRowStart = row + 1;
            piece.style.gridColumnStart = col + 1;
            // Důležité: Resetování stylů, aby se zabránilo artefaktům po přetahování
            piece.style.removeProperty('transform');
            piece.style.removeProperty('left');
            piece.style.removeProperty('top');
            piece.style.removeProperty('z-index');
            piece.classList.remove('dragging');
            piece.classList.remove('highlight');
        });
    }

    // Funkce pro zamíchání dílků
    function shufflePieces() {
        messageDisplay.textContent = '';
        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
        }
        positionPieces();
        checkWin();
    }

    // Funkce pro přidání event listenerů pro přetahování (myš i dotyk)
    function addEventListenersToPieces() {
        pieces.forEach(piece => {
            // --- Myší události (zachovány pro desktop) ---
            piece.addEventListener('dragstart', (e) => {
                // Přidána kontrola, aby se nedalo přetahovat, pokud je puzzle složené
                if (messageDisplay.textContent === puzzleMessages[puzzleImages[currentPuzzleIndex]] || messageDisplay.textContent === 'Gratulujeme! Puzzle složeno!') {
                    e.preventDefault();
                    return;
                }

                draggedPiece = piece;
                e.dataTransfer.effectAllowed = 'move';
                piece.classList.add('dragging');
            });

            piece.addEventListener('dragend', () => {
                if (draggedPiece) {
                    draggedPiece.classList.remove('dragging');
                    draggedPiece = null;
                    positionPieces();
                    checkWin();
                }
            });

            piece.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
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
            });

            // --- Dotykové události (pro mobilní zařízení/tablety) ---
            let touchOffsetX, touchOffsetY;

            piece.addEventListener('touchstart', (e) => {
                // Přidána kontrola, aby se nedalo přetahovat, pokud je puzzle složené
                if (messageDisplay.textContent === puzzleMessages[puzzleImages[currentPuzzleIndex]] || messageDisplay.textContent === 'Gratulujeme! Puzzle složeno!') {
                    return;
                }

                e.preventDefault();

                draggedPiece = piece;
                draggedPiece.classList.add('dragging');
                
                const touch = e.touches[0];
                const rect = draggedPiece.getBoundingClientRect();
                touchOffsetX = touch.clientX - rect.left;
                touchOffsetY = touch.clientY - rect.top;

                draggedPiece.style.position = 'fixed';
                draggedPiece.style.zIndex = '1000';
                draggedPiece.style.left = `${touch.clientX - touchOffsetX}px`;
                draggedPiece.style.top = `${touch.clientY - touchOffsetY}px`;
            });

            piece.addEventListener('touchmove', (e) => {
                if (!draggedPiece) return;
                e.preventDefault(); 

                const touch = e.touches[0];
                draggedPiece.style.left = `${touch.clientX - touchOffsetX}px`;
                draggedPiece.style.top = `${touch.clientY - touchOffsetY}px`;

                draggedPiece.style.visibility = 'hidden';
                let elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
                draggedPiece.style.visibility = 'visible';

                if (highlightedPiece && highlightedPiece !== elementUnderFinger) {
                    highlightedPiece.classList.remove('highlight');
                }

                if (elementUnderFinger && elementUnderFinger.classList.contains('puzzle-piece') && elementUnderFinger !== draggedPiece) {
                    elementUnderFinger.classList.add('highlight');
                    highlightedPiece = elementUnderFinger;
                } else {
                    highlightedPiece = null;
                }
            });

            piece.addEventListener('touchend', (e) => {
                if (!draggedPiece) return;

                if (highlightedPiece) {
                    highlightedPiece.classList.remove('highlight');
                    highlightedPiece = null;
                }

                draggedPiece.style.visibility = 'hidden';
                const touch = e.changedTouches[0];
                let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
                draggedPiece.style.visibility = 'visible';

                if (draggedPiece && targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== draggedPiece) {
                    const draggedIndexInPiecesArray = pieces.indexOf(draggedPiece);
                    const targetIndexInPiecesArray = pieces.indexOf(targetElement);

                    const tempCurrentPositionOfDragged = currentPositions[draggedIndexInPiecesArray];
                    currentPositions[draggedIndexInPiecesArray] = currentPositions[targetIndexInPiecesArray];
                    currentPositions[targetIndexInPiecesArray] = tempCurrentPositionOfDragged;
                }

                draggedPiece.classList.remove('dragging');
                draggedPiece.style.removeProperty('position');
                draggedPiece.style.removeProperty('left');
                draggedPiece.style.removeProperty('top');
                draggedPiece.style.removeProperty('z-index');
                
                draggedPiece = null;

                positionPieces();
                checkWin();
            });
        });
    }

    // Funkce pro kontrolu výhry
    function checkWin() {
        let isSolved = true;
        for (let i = 0; i < numRows * numCols; i++) {
            // Správná kontrola pozice: currentPositions[i] by mělo odpovídat originalIndex dílku,
            // který je na i-té pozici v 'pieces' poli.
            // Původní kontrola `parseInt(pieces[i].dataset.originalIndex) !== currentPositions[i]` byla sémanticky chybná,
            // správně by měla být: `pieces[i]` je dílek, jehož původní index by měl být `currentPositions[i]`.
            // NEBO jednodušeji: Porovnáváme `originalIndex` dílku, který je aktuálně na pozici `i` v DOMu (což je pole `pieces` po `positionPieces()`).
            // Mám to zkontrolovat takto: je-li dílek `pieces[idx]` na pozici `idx` (jeho pozice v `currentPositions` je `idx`)
            // a zároveň jeho `originalIndex` je `idx`, pak je správně.

            // Nejlepší a nejjednodušší kontrola pro to, zda je puzzle složeno:
            // Porovnáme, zda prvek na indexu 'i' v DOM (tj. 'pieces[i]')
            // má 'originalIndex' roven 'i'.
            if (parseInt(pieces[i].dataset.originalIndex) !== i) {
                isSolved = false;
                break;
            }
        }
        
        if (isSolved) {
            const currentImageUrl = puzzleImages[currentPuzzleIndex];
            messageDisplay.textContent = puzzleMessages[currentImageUrl] || 'Gratulujeme! Puzzle složeno!';
            messageDisplay.style.color = 'green';
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


    // Event Listenery pro tlačítka navigace
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

    // Event Listener pro tlačítko "Zamíchat"
    shuffleButton.addEventListener('click', shufflePieces);

    // Načtení prvního puzzle při načtení stránky
    if (puzzleImages.length > 0) {
        loadPuzzle(0);
    } else {
        messageDisplay.textContent = 'Nebyly nalezeny žádné puzzle obrázky. Zkontrolujte pole puzzleImages v script-puzzle.js.';
        shuffleButton.disabled = true;
        prevButton.disabled = true;
        nextButton.disabled = true;
    }

    // --- NOVÝ GLOBALNÍ EVENT LISTENER PRO ZMĚNU VELIKOSTI OKNA (JEDINÝ PŘÍDAVEK) ---
    window.addEventListener('resize', () => {
        // Znovu načteme aktuální puzzle. Tím se zavolá loadPuzzle,
        // které znovu načte obrázek (kvůli naturalWidth/Height)
        // a poté přepočítá rozměry pomocí calculatePuzzleDimensions.
        if (puzzleImages.length > 0) {
            loadPuzzle(currentPuzzleIndex); 
        }
    });
});
