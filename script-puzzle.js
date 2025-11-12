// script-puzzle.js

document.addEventListener('DOMContentLoaded', () => {

    // --- KLÍČOVÁ ZMĚNA 1: FUNKCE PRO STABILIZACI VÝŠKY NA MOBILECH ---
    function setViewportHeightUnit() {
        // Měříme skutečnou výšku okna a definujeme novou CSS proměnnou --vh
        let vh = window.innerHeight * 0.01;
        // Nastavíme --vh na kořenový element dokumentu (html)
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Spustit jednou při načtení a pak při každé změně velikosti/orientace
    setViewportHeightUnit();
    window.addEventListener('resize', setViewportHeightUnit);


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
    let currentImageNaturalWidth = 0;
    let currentImageNaturalHeight = 0;
    
    let isSolved = false; 

    // --- Pole obrázků a zpráv (ponecháno beze změny) ---
    const puzzleImages = [
        'images/puzzle1.jpg',
        'images/puzzle2.jpg',
        'images/Borotin4R.jpg',
        'images/Borotin4R2.jpg',
        'images/puzzle3.jpg',
        'images/puzzle4.jpg',
        'images/puzzle5.jpg',
        'images/Michov10R.jpg',
        'images/Michov10R2.jpg',
        'images/puzzle6.jpg',
        'images/puzzle7.jpg',
        'images/puzzle8.jpg',
        'images/Vanovice4R.jpg',
        'images/Vanovice4R2.jpg',
        'images/puzzle9.jpg',
        'images/puzzle10.jpg', 
        'images/osada3R.jpg',
        'images/OsadaR.jpg',
        'images/puzzle11.jpg',
        'images/puzzle12.jpg',
        'images/Vanovice6R.jpg',
        'images/Vanovice6R2.jpg',
        'images/puzzle13.jpg',
        'images/puzzle14.jpg',
        'images/puzzle15.jpg',
        'images/puzzle16.jpg',
        'images/VelkeOpatovice1R.jpg',
        'images/VelkeOpatovice1R2.jpg',
        'images/puzzle17.jpg',
        'images/puzzle18.jpg',
        'images/puzzle19.jpg',
        'images/tkaniR.jpg',
        'images/puzzle20.jpg',
        'images/puzzle21.jpg',
        'images/hrobR.jpg',
    ];

    const puzzleMessages = {
        'images/puzzle1.jpg': 'Bronzová sekera s tulejí, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle2.jpg': 'Bronzový srp, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Borotin4R.jpg': 'Rekonstrukce vzhledu ženy s použitím artefaktů z depotu Borotín 4. Doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Borotin4R2.jpg': 'Depot Borotín 4 - původně jej tvořily dva šperky: spona ukončená růžicemi a náhrdelník složený z osmi závěsků ve tvaru koleček, závěsku ve tvaru srpku, jednoduchého litého kroužku, trubiček a točeného drátu.',
        'images/puzzle3.jpg': 'Bronzová růžicová spona, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle4.jpg': 'Bronzový lunicovitý závěsek s tulejkou, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle5.jpg': 'Bronzový závěsek, starší doba bronzová - věteřovská kultura (cca 1700-1500 př.n.l.)',
        'images/Michov10R.jpg': 'Rekonstrukce vzhledu ženy na základě luxusní ženské garnitury z depotu Míchov 10. Doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Michov10R2.jpg': 'Depotový soubor Míchov 10 tvoří dva masivní spirálovité náramky ukončené růžicemi a dva křehké spirálovité nánožníky s růžicemi.',
        'images/puzzle6.jpg': 'Bronzová sekera s laloky, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle7.jpg': 'Bronzové kopí s tulejkou, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle8.jpg': 'Svitek zlatého drátu, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Vanovice4R.jpg': 'Rekonstrukce párového nošení dlouhých jehlic u žen na základě depotu Vanovice 4. Doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Vanovice4R2.jpg': 'Depot Vanovice 4 je tvořen pouze jedním typem šperku – dvěma páry identických jehlic, netypicky dlouhých a zdobených jemnou rytou výzdobou.',
        'images/puzzle9.jpg': 'Bronzové udidlo, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle10.jpg': 'Licí formy, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/osada3R.jpg': 'Rekonstrukce nadzemního domu kůlové konstrukce',
        'images/OsadaR.jpg': 'Rekonstrukce osady doby bronzové',
        'images/puzzle11.jpg': 'Jantarový korálek, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle12.jpg': 'Bronzový závěsek, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Vanovice6R.jpg': 'Rekonstrukce nošení depotu Vanovice 6. Doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/Vanovice6R2.jpg': 'Depot Vanovice 6 obsahoval celkem šest kusů, z toho většinu představují šperky malých rozměrů, odpovídajících dětské velikosti: dva ozdobné kruhy (nákrčníky) a dva náramky. Depot dále obsahoval břitvu a drobnou hlavici jehlice s jemnou výzdobou',
        'images/puzzle13.jpg': 'Bronzová štítová spona, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle14.jpg': 'Výzdobný motiv štítové spony, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle15.jpg': 'Bronzové kladívko, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle16.jpg': 'Bronzový spirálovitý nápažník, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/VelkeOpatovice1R.jpg': 'Rekonstrukce mužské osobní výbavy na základě depotu Velké Opatovice 1. Doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/VelkeOpatovice1R2.jpg': 'Depot Velké Opatovice 1 byl složen z nástroje (sekery), zbraně (kopí s tulejí) a šperku sloužícího k sepnutí šatů (jehlice)',
        'images/puzzle17.jpg': 'Rukojeť bronzového meče, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle18.jpg': 'Keramická nádoba, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle19.jpg': 'Bronzové dláto s tulejí, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/tkaniR.jpg': 'Tkaní na jednoduchém tkalcovském stavu',
        'images/puzzle20.jpg': 'Bronzový spirálovitý náramek, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/puzzle21.jpg': 'Bronzový náramek, doba bronzová - kultura lužických popelnicových polí (cca 1300-750 př.n.l.)',
        'images/hrobR.jpg': 'Rekonstrukce pohřbu - typickým pohřbem kultury lužických popelnicových polí byl žárový pohřeb uložený v keramické nádobě.',
    };
    
    let currentPuzzleIndex = 0;
    let pieces = [];
    let currentPositions = [];
    let originalPositions = [];

    let draggedPiece = null;
    let highlightedPiece = null; 

    let offsetX = 0; 
    let offsetY = 0;

    // --- KLÍČOVÁ OPRAVA: PŘESNĚJŠÍ VÝPOČET DIMENZÍ pro PC ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const navigationControls = document.querySelector('.navigation-controls');
        const gameControls = document.querySelector('.game-controls');
        const header = document.querySelector('.header');
        const backButton = document.querySelector('.back-button');
        
        // --- 1. Výpočet dostupné horizontální šířky ---
        const styleBody = window.getComputedStyle(document.body);
        // Počítáme s celkovým horizontálním prostorem (10px rezerva)
        const maxAllowedWidth = viewportWidth - 20; 
        
        // --- 2. Výpočet dostupného svislého prostoru ---
        
        let topOccupiedSpace = 0;
        let bottomOccupiedSpace = 0;
        
        // Měříme výšku horních prvků: header, navigace a mezery
        if (header) {
            topOccupiedSpace += header.offsetHeight + 20; // 20px margin-bottom z CSS
        }
        
        if (navigationControls) {
            topOccupiedSpace += navigationControls.offsetHeight + 10; // 10px margin-bottom z CSS
        }

        // Měříme výšku spodních prvků: game-controls, message
        if (gameControls) {
            bottomOccupiedSpace += gameControls.offsetHeight + 10; // 10px margin-bottom z CSS
        }
        
        const message = document.getElementById('message');
        if (message) {
             bottomOccupiedSpace += message.offsetHeight + 20; // 20px margin-top, 20px margin-bottom z body
        }
        
        // back-button je fixed, ten nepočítáme do toku.
        
        // Celková vertikální mezera pro puzzle
        // Odecítáme 40px celkem (20px padding shora a 20px padding zdola, pokud ho body má)
        let maxAvailableHeight = viewportHeight - topOccupiedSpace - bottomOccupiedSpace - 20; // 20px rezerva

        
        // Zajištění minimální velikosti
        if (maxAvailableHeight <= 150) {
            maxAvailableHeight = 300; 
        }
        
        // --- 3. Výpočet finálních rozměrů s ohledem na poměr stran ---
        const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
        
        let finalWidth;
        let finalHeight;
        
        // 1. Dimenzujeme podle ŠÍŘKY (PC priorita)
        finalWidth = maxAllowedWidth;
        finalHeight = finalWidth / imageAspectRatio;
        
        if (finalHeight > maxAvailableHeight) {
             // 2. Pokud je výška příliš velká (mobil, menší PC), dimenzujeme podle VÝŠKY
            finalHeight = maxAvailableHeight;
            finalWidth = finalHeight * imageAspectRatio;
        }

        // Zajištění absolutní minimální velikosti
        finalWidth = Math.max(finalWidth, 150);
        finalHeight = Math.max(finalHeight, 150);
        
        // Aplikace rozměrů
        dynamicTotalPuzzleWidth = finalWidth;
        dynamicTotalPuzzleHeight = finalHeight;

        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;

        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

        // Nastavení CSS proměnných pro dílky
        puzzleContainer.style.setProperty('--puzzle-total-width', `${dynamicTotalPuzzleWidth}px`);
        puzzleContainer.style.setProperty('--puzzle-total-height', `${dynamicTotalPuzzleHeight}px`);
    }

    // --- Funkce pro PŘEPÍSNUTÍ rozměrů dílků při resize ---
    function recalculateDimensions() {
        setViewportHeightUnit(); 
        
        if (currentImageNaturalWidth > 0 && currentImageNaturalHeight > 0) {
            
            calculatePuzzleDimensions(currentImageNaturalWidth, currentImageNaturalHeight);
            
            const pieceWidth = dynamicTotalPuzzleWidth / numCols;
            const pieceHeight = dynamicTotalPuzzleHeight / numRows;
            
            pieces.forEach((piece, i) => {
                const row = Math.floor(i / numCols);
                const col = i % numCols;

                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundSize = `${dynamicTotalPuzzleWidth}px ${dynamicTotalPuzzleHeight}px`;
                piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            });

            positionPieces(); 
        }
    }


    function loadPuzzle(index) {
        if (index < 0 || index >= puzzleImages.length) {
            console.error('Neplatný index puzzle obrázku.');
            return;
        }

        currentPuzzleIndex = index;
        const imageUrl = puzzleImages[currentPuzzleIndex];
        puzzleInfo.textContent = `Puzzle ${currentPuzzleIndex + 1} / ${puzzleImages.length}`;
        messageDisplay.textContent = 'Načítám obrázek...';
        
        // ZAJISTÍME ODEBRÁNÍ TŘÍDY 'solved' při načtení nového puzzle
        puzzleContainer.classList.remove('solved');
        pieces.forEach(piece => piece.classList.remove('correct'));
        isSolved = false; 

        const img = new Image();
        img.onload = () => {
            currentImageNaturalWidth = img.naturalWidth;
            currentImageNaturalHeight = img.naturalHeight;
            
            calculatePuzzleDimensions(currentImageNaturalWidth, currentImageNaturalHeight); 
            initializePuzzle(imageUrl);

            prevButton.disabled = (currentPuzzleIndex === 0);
            nextButton.disabled = (currentPuzzleIndex === puzzleImages.length - 1);
            shuffleButton.disabled = false;
        };
        img.onerror = () => {
            console.error(`Nepodařilo se načíst obrázek: Zkontrolujte cestu ${imageUrl}`);
            messageDisplay.textContent = `Chyba při načítání obrázku. Zkontrolujte, zda soubor ${imageUrl} existuje ve správné složce.`;
            puzzleContainer.innerHTML = '';
            prevButton.disabled = true;
            nextButton.disabled = true;
            shuffleButton.disabled = true;
        };
        img.src = imageUrl;
    }

    
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
            piece.style.backgroundSize = `${dynamicTotalPuzzleWidth}px ${dynamicTotalPuzzleHeight}px`;
            
            piece.dataset.originalIndex = i;

            pieces.push(piece);
            currentPositions.push(i);
            originalPositions.push(i);

            puzzleContainer.appendChild(piece);
        }

        addEventListenersToPieces();
        
        currentPositions = [...originalPositions]; 
        positionPieces(); 

        shufflePieces(); 
    }
    
    function positionPieces() {
        pieces.forEach((piece, index) => {
            const targetIndex = currentPositions[index];
            const row = Math.floor(targetIndex / numCols);
            const col = targetIndex % numCols;
            piece.style.gridRowStart = row + 1;
            piece.style.gridColumnStart = col + 1;
            piece.style.removeProperty('transform'); 
            piece.style.removeProperty('left');
            piece.style.removeProperty('top');
            piece.style.removeProperty('z-index');
        });
    }
    
    function shufflePieces() {
        if(isSolved) {
            messageDisplay.textContent = '';
            // Odebere třídu 'solved' a 'correct' pro přípravu na nové míchání
            puzzleContainer.classList.remove('solved');
            pieces.forEach(piece => piece.classList.remove('correct')); 
        }

        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
        }
        positionPieces();
        isSolved = false; 
        checkWin();
    }
    
    // ... (Funkce startDrag, dragMove, endDrag, addEventListenersToPieces - ponechány beze změny) ...
    // Kvůli přehlednosti ponechávám jen checkWin
    function startDrag(e) {
        if (isSolved) {
            return; 
        }

        e.preventDefault(); 
        draggedPiece = e.currentTarget; 
        draggedPiece.classList.add('dragging');
        
        const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
        
        draggedPiece.style.position = 'fixed';
        draggedPiece.style.transform = 'translate(-50%, -50%)'; 
        
        offsetX = 0; 
        offsetY = 0;
        
        draggedPiece.style.left = `${clientX}px`;
        draggedPiece.style.top = `${clientY}px`;
        draggedPiece.style.zIndex = 1000;


        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', endDrag);
        }
    }

    function dragMove(e) {
        if (!draggedPiece) return;
        e.preventDefault();
        
        const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
        
        draggedPiece.style.left = `${clientX + offsetX}px`;
        draggedPiece.style.top = `${clientY + offsetY}px`;
        
        draggedPiece.style.visibility = 'hidden';
        let elementUnderCursor = document.elementFromPoint(clientX, clientY);
        draggedPiece.style.visibility = 'visible';
        
        if (highlightedPiece && highlightedPiece !== elementUnderCursor) {
            highlightedPiece.classList.remove('highlight');
        }
        
        if (elementUnderCursor && elementUnderCursor.classList.contains('puzzle-piece') && elementUnderCursor !== draggedPiece) {
            elementUnderCursor.classList.add('highlight');
            highlightedPiece = elementUnderCursor;
        } else {
            if (highlightedPiece) {
                highlightedPiece.classList.remove('highlight');
                highlightedPiece = null;
            }
        }
    }

    function endDrag(e) {
        if (!draggedPiece) return;
        
        const clientX = e.clientX !== undefined ? e.clientX : e.changedTouches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.changedTouches[0].clientY;
        
        draggedPiece.style.visibility = 'hidden';
        let targetElement = document.elementFromPoint(clientX, clientY);
        draggedPiece.style.visibility = 'visible';
        
        if (targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== draggedPiece) {
            const draggedIndexInPiecesArray = pieces.indexOf(draggedPiece);
            const targetIndexInPiecesArray = pieces.indexOf(targetElement);
            
            const tempCurrentPositionOfDragged = currentPositions[draggedIndexInPiecesArray];
            currentPositions[draggedIndexInPiecesArray] = currentPositions[targetIndexInPiecesArray];
            currentPositions[targetIndexInPiecesArray] = tempCurrentPositionOfDragged;
        }
        
        draggedPiece.classList.remove('dragging');
        draggedPiece.style.position = 'relative'; 
        draggedPiece.style.removeProperty('transform');
        draggedPiece.style.removeProperty('z-index');
        draggedPiece.style.removeProperty('left');
        draggedPiece.style.removeProperty('top');

        if (highlightedPiece) {
            highlightedPiece.classList.remove('highlight');
            highlightedPiece = null;
        }
        
        draggedPiece = null;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', endDrag);
        
        positionPieces(); 
        checkWin();
    }

    function addEventListenersToPieces() {
        pieces.forEach(piece => {
            piece.addEventListener('mousedown', startDrag);
            piece.addEventListener('touchstart', (e) => { 
                e.stopPropagation(); 
                startDrag(e); 
            }, { passive: false });
            piece.addEventListener('touchmove', (e) => {
                e.stopPropagation();
                dragMove(e);
            }, { passive: false });
            piece.addEventListener('touchend', (e) => {
                e.stopPropagation();
                endDrag(e);
            });
        });
    }
    
    // --- KLÍČOVÁ OPRAVA: checkWin pro přidání třídy 'solved' ---
    function checkWin() {
        // Při každé kontrole nejdříve odebereme, aby se při dalším tahu znovu aktivovala mřížka
        puzzleContainer.classList.remove('solved'); 
        
        let currentlySolved = true;
        for (let i = 0; i < numRows * numCols; i++) {
            // Kontrola: Je dílek, který je nyní na pozici 'i' (currentPositions[i]),
            // ten, jehož původní index (dataset.originalIndex) je roven 'i'?
            if (parseInt(pieces[i].dataset.originalIndex) !== currentPositions[i]) {
                currentlySolved = false;
                break;
            }
        }
        
        isSolved = currentlySolved;

        if (isSolved) {
            // PŘIDÁNÍ TŘÍDY 'solved' PRO SKRYTÍ MŘÍŽKY V CSS
            puzzleContainer.classList.add('solved'); 
            
            const currentImageUrl = puzzleImages[currentPuzzleIndex];
            messageDisplay.textContent = puzzleMessages[currentImageUrl] || 'Gratulujeme! Puzzle složeno!';
            pieces.forEach(piece => piece.classList.add('correct'));
            shuffleButton.disabled = false; 
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

    shuffleButton.addEventListener('click', shufflePieces);

    if (puzzleImages.length > 0) {
        loadPuzzle(0);
    } else {
        messageDisplay.textContent = 'Nebyly nalezeny žádné puzzle obrázky. Zkontrolujte pole puzzleImages v script-puzzle.js.';
        shuffleButton.disabled = true;
        prevButton.disabled = true;
        nextButton.disabled = true;
    }

    // --- Debounce pro resize (volá POUZE přepočet dimenzí, bez nového míchání) ---
    let resizeTimer;
    let currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    window.addEventListener('resize', () => {
        // Opětovné nastavení --vh hodnoty, aby se zachytila nová, stabilní velikost
        setViewportHeightUnit(); 
        
        clearTimeout(resizeTimer);
        const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        
        if (newOrientation !== currentOrientation) {
            currentOrientation = newOrientation;
            // Delší zpoždění pro skutečnou změnu orientace
            resizeTimer = setTimeout(recalculateDimensions, 250);
        } else {
            // Rychlejší zpoždění pro skrytí/zobrazení lišty (resize s neměnnou orientací)
            resizeTimer = setTimeout(recalculateDimensions, 50); 
        }
    });
});




