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
    let dragOffsetX, dragOffsetY; // Znovu zavedeno pro dotykové přetahování pro kompatibilitu s původním kódem.

    // --- Funkce pro výpočet rozměrů puzzle na základě velikosti okna a poměru stran obrázku ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        if (imageNaturalWidth === 0 || imageNaturalHeight === 0) {
            console.warn("Rozměry obrázku nejsou načteny. Nelze vypočítat rozměry puzzle.");
            return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const originalAspectRatio = imageNaturalWidth / imageNaturalHeight;

        // Dynamicky měříme výšky ostatních prvků UI
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const navControlsHeight = document.querySelector('.navigation-controls')?.offsetHeight || 0;
        const gameControlsHeight = document.querySelector('.game-controls')?.offsetHeight || 0;
        const messageHeight = messageDisplay.offsetHeight || 0;
        const backButtonHeight = document.querySelector('.back-button')?.offsetHeight || 0;

        // Zohlednění paddingů z body elementu
        const bodyStyle = getComputedStyle(document.body);
        const bodyPaddingTop = parseFloat(bodyStyle.paddingTop) || 0;
        const bodyPaddingBottom = parseFloat(bodyStyle.paddingBottom) || 0;
        const bodyPaddingLeft = parseFloat(bodyStyle.paddingLeft) || 0;
        const bodyPaddingRight = parseFloat(bodyStyle.paddingRight) || 0;
        
        // Celkový vertikální prostor, který UI prvky zabírají
        let totalOccupiedVerticalSpace = headerHeight + navControlsHeight + gameControlsHeight + messageHeight + backButtonHeight + bodyPaddingTop + bodyPaddingBottom;
        
        // Přidáme dodatečnou rezervu pro mezery a vizuální oddělení (může být doladěno)
        const additionalVerticalReserve = 40; // Pixely
        totalOccupiedVerticalSpace += additionalVerticalReserve;

        const availableWidth = viewportWidth - (bodyPaddingLeft + bodyPaddingRight) - 20; // Malá horizontální rezerva
        const availableHeight = viewportHeight - totalOccupiedVerticalSpace;

        let calculatedWidth;
        let calculatedHeight;

        // Vypočet tak, aby se obrázek vešel a udržel poměr stran
        calculatedWidth = availableWidth;
        calculatedHeight = availableWidth / originalAspectRatio;

        if (calculatedHeight > availableHeight) {
            // Pokud je vypočítaná výška větší než dostupná, omezíme podle výšky
            calculatedHeight = availableHeight;
            calculatedWidth = availableHeight * originalAspectRatio;
        }

        // Zajištění, že rozměry nebudou záporné nebo příliš malé
        dynamicTotalPuzzleWidth = Math.max(80, calculatedWidth);
        dynamicTotalPuzzleHeight = Math.max(80, calculatedHeight);

        // Konečná kontrola, aby se puzzle vešlo do dostupného prostoru
        if (dynamicTotalPuzzleWidth > availableWidth) {
            dynamicTotalPuzzleWidth = availableWidth;
            dynamicTotalPuzzleHeight = dynamicTotalPuzzleWidth / originalAspectRatio;
        }
        if (dynamicTotalPuzzleHeight > availableHeight) {
            dynamicTotalPuzzleHeight = availableHeight;
            dynamicTotalPuzzleWidth = dynamicTotalPuzzleHeight * originalAspectRatio;
        }

        // Ještě jednou ověření minimálních hodnot pro stabilitu
        dynamicTotalPuzzleWidth = Math.max(10, dynamicTotalPuzzleWidth);
        dynamicTotalPuzzleHeight = Math.max(10, dynamicTotalPuzzleHeight);


        // Nastavíme CSS proměnné a grid pro puzzle kontejner
        puzzleContainer.style.setProperty('--puzzle-total-width', `${dynamicTotalPuzzleWidth}px`);
        puzzleContainer.style.setProperty('--puzzle-total-height', `${dynamicTotalPuzzleHeight}px`);
        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;
        
        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

        // Aktualizujeme pozadí dílků, pokud už existují
        pieces.forEach(piece => {
            const row = Math.floor(parseInt(piece.dataset.originalIndex) / numCols);
            const col = parseInt(piece.dataset.originalIndex) % numCols;
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundSize = `${dynamicTotalPuzzleWidth}px ${dynamicTotalPuzzleHeight}px`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
        });
    }

    // --- Funkce pro vytvoření dílků puzzle ---
    function createPuzzlePieces(imageUrl) {
        puzzleContainer.innerHTML = '';
        pieces = [];
        currentPositions = [];
        originalPositions = [];

        const img = new Image();
        img.onload = function() {
            // Po načtení obrázku a získání jeho přirozených rozměrů, vypočítáme rozměry puzzle
            calculatePuzzleDimensions(this.naturalWidth, this.naturalHeight);

            const pieceWidth = dynamicTotalPuzzleWidth / numCols;
            const pieceHeight = dynamicTotalPuzzleHeight / numRows;

            for (let i = 0; i < numRows * numCols; i++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.dataset.originalIndex = i; // Původní index dílku

                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundImage = `url(${imageUrl})`;
                piece.style.backgroundSize = `${dynamicTotalPuzzleWidth}px ${dynamicTotalPuzzleHeight}px`;

                const row = Math.floor(i / numCols);
                const col = i % numCols;
                piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;

                pieces.push(piece); // Pole 'pieces' obsahuje dílky v původním, složeném pořadí
                currentPositions.push(piece); // 'currentPositions' bude obsahovat dílky v jejich aktuálním, promíchaném pořadí v DOM
                puzzleContainer.appendChild(piece);
            }
            shufflePieces(); // Zamícháme dílky
            positionPieces(); // Vykreslíme dílky na správná místa v mřížce
            updateButtonStates(); // Aktualizujeme stav tlačítek
            checkCompletion(); // Zkontrolujeme stav po načtení
        };
        img.onerror = function() {
            messageDisplay.textContent = 'Chyba při načítání obrázku.';
            shuffleButton.disabled = true;
            prevButton.disabled = true;
            nextButton.disabled = true;
        };
        img.src = imageUrl;
    }

    // --- Funkce pro pozici dílků v DOM (pro vizuální uspořádání) ---
    function positionPieces() {
        // Vyčistíme kontejner a přidáme dílky zpět v novém pořadí
        puzzleContainer.innerHTML = '';
        currentPositions.forEach(piece => {
            puzzleContainer.appendChild(piece);
            // Odstranění dočasných stylů pro přetahování, pokud by zůstaly
            piece.style.removeProperty('position');
            piece.style.removeProperty('left');
            piece.style.removeProperty('top');
            piece.style.removeProperty('z-index');
            piece.classList.remove('dragging');
            piece.classList.remove('highlight');
        });
    }

    // --- Funkce pro kontrolu, zda je puzzle složeno ---
    function checkCompletion() {
        let correctPieces = 0;
        // Zde je klíčová oprava: Iterujeme přes AKTUÁLNÍ DÍLKY V DOM
        for (let i = 0; i < puzzleContainer.children.length; i++) {
            const currentPieceInDOM = puzzleContainer.children[i];
            // Kontrolujeme, zda je dílek na i-té pozici v DOM skutečně dílek s původním indexem i
            if (parseInt(currentPieceInDOM.dataset.originalIndex) === i) {
                currentPieceInDOM.classList.add('correct');
                correctPieces++;
            } else {
                currentPieceInDOM.classList.remove('correct');
            }
        }

        if (correctPieces === pieces.length) {
            const currentImageUrl = puzzleImages[currentPuzzleIndex];
            messageDisplay.textContent = puzzleMessages[currentImageUrl] || 'Výborně! Puzzle je složeno!';
            messageDisplay.style.color = 'green';
            shuffleButton.disabled = true;
            // Důležité: Ujistit se, že všechny dílky mají třídu 'correct' po vyřešení
            for (let i = 0; i < puzzleContainer.children.length; i++) {
                puzzleContainer.children[i].classList.add('correct');
            }
        } else {
            messageDisplay.textContent = ''; // Vymaže zprávu, pokud není složeno
            messageDisplay.style.color = ''; // Reset barvy textu
            // Důležité: Odebrat třídu 'correct' ze všech dílků, pokud není složeno
            for (let i = 0; i < puzzleContainer.children.length; i++) {
                puzzleContainer.children[i].classList.remove('correct');
            }
            if (pieces.length > 0) {
                shuffleButton.disabled = false;
            }
        }
    }

    // --- Funkce pro zamíchání dílků ---
    function shufflePieces() {
        // Odebereme "correct" třídu ze všech dílků před zamícháním
        currentPositions.forEach(piece => piece.classList.remove('correct'));
        messageDisplay.textContent = ''; // Vymaže zprávu

        const tempCurrentPositions = [...currentPositions]; // Vytvoříme kopii pole currentPositions pro Fisher-Yates shuffle
        for (let i = tempCurrentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tempCurrentPositions[i], tempCurrentPositions[j]] = [tempCurrentPositions[j], tempCurrentPositions[i]];
        }
        currentPositions = tempCurrentPositions; // Aktualizujeme currentPositions na zamíchané pořadí
        
        positionPieces(); // Aplikujeme zamíchané pozice na skutečné DOM elementy
        checkCompletion(); // Zkontrolujeme, zda se náhodou nevyhrálo (velmi nepravděpodobné)
        updateButtonStates(); // Aktualizujte stav tlačítek
    }

    // --- Funkce pro drag & drop ---
    // Event listener pro začátek přetahování
    puzzleContainer.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('puzzle-piece')) return;
        // Nelze přetahovat, pokud je puzzle složené nebo dílek má třídu 'correct'
        if (e.target.classList.contains('correct') && messageDisplay.textContent !== '') return;

        draggedPiece = e.target;
        draggedPiece.classList.add('dragging');
        // Vypočítáme offset pro plynulejší přetahování
        const rect = draggedPiece.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        draggedPiece.style.position = 'fixed'; // Dočasně změníme pozici pro přetahování
        draggedPiece.style.zIndex = '1000';
        
        // Přidáme listener pro mousemove na celý dokument, abychom chytali pohyb mimo kontejner
        document.addEventListener('mousemove', onMouseMove);
        // Přidáme listener pro mouseup na celý dokument
        document.addEventListener('mouseup', onMouseUp);
    });

    // Event listener pro pohyb myši (přetahování)
    function onMouseMove(e) {
        if (!draggedPiece) return;

        // Vypočítáme novou pozici pro "ducha" dílku
        draggedPiece.style.left = `${e.clientX - dragOffsetX}px`;
        draggedPiece.style.top = `${e.clientY - dragOffsetY}px`;

        // Highlightování cílového dílku
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        document.querySelectorAll('.puzzle-piece').forEach(p => {
            if (p !== draggedPiece) { // Odstranit highlight ze všech ostatních dílků
                p.classList.remove('highlight');
            }
        });

        if (targetPiece && targetPiece !== draggedPiece) {
            targetPiece.classList.add('highlight');
        }
    }

    // Event listener pro konec přetahování
    function onMouseUp(e) {
        if (!draggedPiece) return;

        draggedPiece.classList.remove('dragging');
        draggedPiece.style.removeProperty('position');
        draggedPiece.style.removeProperty('left');
        draggedPiece.style.removeProperty('top');
        draggedPiece.style.removeProperty('z-index');

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Najdeme cíl pro upuštění
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        if (targetPiece && targetPiece !== draggedPiece) {
            // Výměna pozic v poli 'currentPositions'
            const draggedIndex = currentPositions.indexOf(draggedPiece);
            const targetIndex = currentPositions.indexOf(targetPiece);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                [currentPositions[draggedIndex], currentPositions[targetIndex]] = [currentPositions[targetIndex], currentPositions[draggedIndex]];
            }
        }
        positionPieces(); // Znovu umístíme všechny dílky do mřížky
        checkCompletion(); // Zkontrolujeme dokončení
        draggedPiece = null;
        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('highlight'));
    }

    // --- Dotykové události pro mobilní zařízení ---
    let touchDraggedPiece = null;

    puzzleContainer.addEventListener('touchstart', (e) => {
        if (!e.target.classList.contains('puzzle-piece')) return;
        // Nelze přetahovat, pokud je puzzle složené nebo dílek má třídu 'correct'
        if (e.target.classList.contains('correct') && messageDisplay.textContent !== '') return;

        e.preventDefault(); // Zabrání výchozímu chování (např. posouvání stránky)

        touchDraggedPiece = e.target;
        touchDraggedPiece.classList.add('dragging');
        
        const touch = e.touches[0];
        const rect = touchDraggedPiece.getBoundingClientRect();
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;

        touchDraggedPiece.style.position = 'fixed';
        touchDraggedPiece.style.zIndex = '1000';
        touchDraggedPiece.style.left = `${touch.clientX - dragOffsetX}px`;
        touchDraggedPiece.style.top = `${touch.clientY - dragOffsetY}px`;


        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    });

    function onTouchMove(e) {
        if (!touchDraggedPiece) return;
        e.preventDefault(); // Zabrání posouvání stránky během přetahování

        const touch = e.touches[0];
        touchDraggedPiece.style.left = `${touch.clientX - dragOffsetX}px`;
        touchDraggedPiece.style.top = `${touch.clientY - dragOffsetY}px`;

        // Highlightování cílového dílku
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        document.querySelectorAll('.puzzle-piece').forEach(p => {
            if (p !== touchDraggedPiece) {
                p.classList.remove('highlight');
            }
        });

        if (targetPiece && targetPiece !== touchDraggedPiece) {
            targetPiece.classList.add('highlight');
        }
    }

    function onTouchEnd(e) {
        if (!touchDraggedPiece) return;

        touchDraggedPiece.classList.remove('dragging');
        touchDraggedPiece.style.removeProperty('position');
        touchDraggedPiece.style.removeProperty('left');
        touchDraggedPiece.style.removeProperty('top');
        touchDraggedPiece.style.removeProperty('z-index');

        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);

        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        if (touchDraggedPiece && targetPiece && touchDraggedPiece !== targetPiece) {
            const draggedIndex = currentPositions.indexOf(touchDraggedPiece);
            const targetIndex = currentPositions.indexOf(targetPiece);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                [currentPositions[draggedIndex], currentPositions[targetIndex]] = [currentPositions[targetIndex], currentPositions[draggedIndex]];
            }
        }
        positionPieces();
        checkCompletion();
        touchDraggedPiece = null;
        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('highlight'));
    }


    // --- Funkce pro aktualizaci stavu tlačítek navigace ---
    function updateButtonStates() {
        prevButton.disabled = (currentPuzzleIndex === 0);
        nextButton.disabled = (currentPuzzleIndex === puzzleImages.length - 1);
        // Tlačítko zamíchat je zakázáno pouze po dokončení puzzle
        if (messageDisplay.textContent !== '') { // Pokud je nějaká zpráva (tedy i zpráva o složení)
             shuffleButton.disabled = true;
        } else {
             shuffleButton.disabled = false;
        }
    }

    // --- Funkce pro načtení puzzle (nově zahrnuje načtení rozměrů obrázku) ---
    function loadPuzzle(index) {
        if (index < 0 || index >= puzzleImages.length) {
            console.error("Index puzzle mimo rozsah.");
            return;
        }

        currentPuzzleIndex = index;
        puzzleInfo.textContent = `Puzzle ${currentPuzzleIndex + 1}/${puzzleImages.length}`;
        messageDisplay.textContent = ''; // Vyčistíme zprávu při načítání nového puzzle
        
        // Zde se zavolá createPuzzlePieces, které načte obrázek a spustí calculatePuzzleDimensions
        createPuzzlePieces(puzzleImages[currentPuzzleIndex]);
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

    // --- Přidáme listener pro změnu velikosti okna, aby se puzzle přepočítalo ---
    window.addEventListener('resize', () => {
        if (puzzleImages.length > 0) {
            // Zavoláme loadPuzzle pro aktuální index, což spustí přepočet rozměrů
            loadPuzzle(currentPuzzleIndex); 
        }
    });
});
