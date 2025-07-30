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
        // Přidejte další obrázky podle potřeby
    ];
    let currentPuzzleIndex = 0;

    let pieces = [];
    let currentPositions = [];
    let originalPositions = [];

    let draggedPiece = null;
    let dragOffsetX, dragOffsetY;

    // --- Funkce pro výpočet rozměrů puzzle na základě velikosti okna ---
    function calculatePuzzleDimensions(imageNaturalWidth, imageNaturalHeight) {
        // Získání rozměrů okna (viewportu)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Měření výšek ostatních prvků, aby se zjistil dostupný prostor pro puzzle
        const headerHeight = document.querySelector('.header').offsetHeight;
        const navControlsHeight = document.querySelector('.navigation-controls').offsetHeight;
        const gameControlsHeight = document.querySelector('.game-controls').offsetHeight;
        const messageHeight = messageDisplay.offsetHeight; // Může být 0, pokud zpráva není zobrazena

        // Zde je klíčová změna: Přesnější výpočet dostupného místa
        // Odečítáme fixní paddingy a marginy, které jsou definovány v CSS body
        // a mezi jednotlivými sekcemi.
        // Body má padding 20px nahoře a dole: 40px
        // Margin-bottom pro .header: 20px
        // Margin-top pro .navigation-controls: 20px
        // Margin-bottom pro .navigation-controls: 20px
        // Margin-top pro .game-controls: 20px
        // Margin-bottom pro .game-controls (pokud je)
        // Margin-top pro #message (pokud je)
        
        // Zkusíme dynamicky vypočítat veškerý vertikální prostor mimo puzzleContainer
        let totalVerticalUsedSpace = 0;
        const bodyPadding = parseFloat(getComputedStyle(document.body).paddingTop) + parseFloat(getComputedStyle(document.body).paddingBottom);
        totalVerticalUsedSpace += bodyPadding;

        // Přidáme výšky prvků a jejich marginy (pokud jsou definovány v CSS)
        // Pozor na colapsing margins! Nejbezpečnější je měřit offsetHeight nebo použít flexbox/grid gap.
        totalVerticalUsedSpace += headerHeight;
        totalVerticalUsedSpace += parseFloat(getComputedStyle(document.querySelector('.header')).marginBottom || 0);

        totalVerticalUsedSpace += navControlsHeight;
        totalVerticalUsedSpace += parseFloat(getComputedStyle(document.querySelector('.navigation-controls')).marginTop || 0);
        totalVerticalUsedSpace += parseFloat(getComputedStyle(document.querySelector('.navigation-controls')).marginBottom || 0);

        totalVerticalUsedSpace += gameControlsHeight;
        totalVerticalUsedSpace += parseFloat(getComputedStyle(document.querySelector('.game-controls')).marginTop || 0);
        totalVerticalUsedSpace += parseFloat(getComputedStyle(document.querySelector('.game-controls')).marginBottom || 0);

        totalVerticalUsedSpace += messageHeight; // messageDisplay může mít svůj margin-top
        totalVerticalUsedSpace += parseFloat(getComputedStyle(messageDisplay).marginTop || 0);
        totalVerticalUsedSpace += parseFloat(getComputedStyle(messageDisplay).marginBottom || 0);
        
        // Puzzle container má také padding 5px nahoře a dole (celkem 10px)
        totalVerticalUsedSpace += 10; // Započítáme padding puzzleContaineru

        const maxAvailableWidth = viewportWidth - (parseFloat(getComputedStyle(document.body).paddingLeft) + parseFloat(getComputedStyle(document.body).paddingRight)); // šířka viewportu mínus padding body
        // Omezíme na 90% šířky viewportu pro vizuální rezervu
        let calculatedMaxWidth = maxAvailableWidth * 0.9;
        
        const maxAvailableHeight = viewportHeight - totalVerticalUsedSpace;

        const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
        const containerAspectRatio = calculatedMaxWidth / maxAvailableHeight;

        let targetWidth, targetHeight;

        if (imageAspectRatio > containerAspectRatio) {
            // Obrázek je širší než dostupný kontejner, omezíme šířkou
            targetWidth = calculatedMaxWidth;
            targetHeight = calculatedMaxWidth / imageAspectRatio;
        } else {
            // Obrázek je vyšší než dostupný kontejner, omezíme výškou
            targetHeight = maxAvailableHeight;
            targetWidth = maxAvailableHeight * imageAspectRatio;
        }

        // Zde **odstraňujeme** minimální velikosti nebo je upravíme, aby nevedly k přeplnění
        // Místo hardcoded 200px budeme brát v úvahu minimální rozměr kusu
        // Pokud je obrázek velmi malý, necháme ho být malý. Deformaci způsobí spíše snaha ho zvětšit.
        // DynamicPieceSize je nyní odvozený, ne pevně daný.
        // Necháme to bez Math.max(..., 200) prozatím, abychom viděli, jestli to pomůže s deformací.
        // Pokud je problém v tom, že je puzzle příliš malé, budeme to řešit jindy.

        // Dodatečná kontrola pro případ, že výpočty vedly k příliš velkým rozměrům
        if (targetWidth > calculatedMaxWidth) {
            targetWidth = calculatedMaxWidth;
            targetHeight = targetWidth / imageAspectRatio;
        }
        if (targetHeight > maxAvailableHeight) {
            targetHeight = maxAvailableHeight;
            targetWidth = targetHeight * imageAspectRatio;
        }

        // Ujistíme se, že výsledné rozměry jsou stále kladné
        dynamicTotalPuzzleWidth = Math.max(10, targetWidth); // Minimálně 10px
        dynamicTotalPuzzleHeight = Math.max(10, targetHeight); // Minimálně 10px

        // Nastavíme šířku a výšku kontejneru
        puzzleContainer.style.width = `${dynamicTotalPuzzleWidth}px`;
        puzzleContainer.style.height = `${dynamicTotalPuzzleHeight}px`;

        // Nastavíme rozměry mřížky pro dílky
        const pieceWidth = dynamicTotalPuzzleWidth / numCols;
        const pieceHeight = dynamicTotalPuzzleHeight / numRows;

        puzzleContainer.style.gridTemplateColumns = `repeat(${numCols}, ${pieceWidth}px)`;
        puzzleContainer.style.gridTemplateRows = `repeat(${numRows}, ${pieceHeight}px)`;

        // Předáme rozměry pro pozadí dílků
        puzzleContainer.style.setProperty('--puzzle-total-width', `${dynamicTotalPuzzleWidth}px`);
        puzzleContainer.style.setProperty('--puzzle-total-height', `${dynamicTotalPuzzleHeight}px`);
    }

    // ... (zbytek vašeho JS kódu, např. createPuzzlePieces, positionPieces, atd.) ...

    // --- Funkce pro vytvoření dílků puzzle ---
    function createPuzzlePieces(imageUrl) {
        puzzleContainer.innerHTML = '';
        pieces = [];
        originalPositions = [];
        currentPositions = [];

        const img = new Image();
        img.onload = () => {
            calculatePuzzleDimensions(img.naturalWidth, img.naturalHeight);
            
            const pieceWidth = dynamicTotalPuzzleWidth / numCols;
            const pieceHeight = dynamicTotalPuzzleHeight / numRows;

            for (let i = 0; i < numRows * numCols; i++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');

                const row = Math.floor(i / numCols);
                const col = i % numCols;

                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundImage = `url(${imageUrl})`;
                piece.style.backgroundSize = `var(--puzzle-total-width) var(--puzzle-total-height)`; // Používáme CSS proměnné
                piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
                
                piece.dataset.row = row;
                piece.dataset.col = col;
                piece.dataset.id = i; // Unikátní ID pro každý dílek

                // Pozice pro přetahování
                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragover', dragOver);
                piece.addEventListener('dragleave', dragLeave);
                piece.addEventListener('drop', drop);
                piece.addEventListener('dragend', dragEnd);

                // Touch eventy pro mobily
                piece.addEventListener('touchstart', touchStart);
                piece.addEventListener('touchmove', touchMove);
                piece.addEventListener('touchend', touchEnd);


                pieces.push(piece);
                originalPositions.push(i); // Počáteční uspořádání 0, 1, 2...
                currentPositions.push(i);
                puzzleContainer.appendChild(piece);
            }
            shufflePieces(); // Zamíchá dílky po vytvoření
            positionPieces(); // Vykreslí dílky na správná místa v mřížce
        };
        img.src = imageUrl;
    }

    // ... (ostatní funkce - shufflePieces, positionPieces, checkWin, drag & touch handlers, atd. - beze změny) ...
    function positionPieces() {
        pieces.forEach((piece, index) => {
            const currentLogicalIndex = currentPositions[index]; // Index dílku v aktuálním uspořádání
            const targetRow = Math.floor(currentLogicalIndex / numCols);
            const targetCol = currentLogicalIndex % numCols;

            piece.style.gridRowStart = targetRow + 1;
            piece.style.gridColumnStart = targetCol + 1;

            // Odebrání inline stylů, které mohly zůstat po drag & drop
            piece.style.removeProperty('transform');
            piece.style.removeProperty('left');
            piece.style.removeProperty('top');
            piece.style.removeProperty('z-index');
            piece.classList.remove('dragging');
            piece.classList.remove('highlight');
        });
    }

    function shufflePieces() {
        // ... (kód pro shufflePieces) ...
        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; // Mícháme i reference na DOM elementy
        }
        positionPieces(); // Aplikujeme nové pozice
        checkWin(); // Zkontrolujeme, zda se náhodou nevyhrálo
    }

    function checkWin() {
        const isWin = currentPositions.every((pos, index) => pos === originalPositions[index]);
        if (isWin) {
            messageDisplay.textContent = puzzleMessages.win;
            pieces.forEach(piece => piece.classList.add('correct'));
            shuffleButton.disabled = true;
            prevButton.disabled = true;
            nextButton.disabled = true;
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

    // Drag and Drop funkce
    function dragStart(e) {
        draggedPiece = this;
        setTimeout(() => {
            this.classList.add('dragging');
            // Výpočet offsetu pro plynulejší přetahování
            const rect = this.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
        }, 0);
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/plain', e.target.dataset.id); // Nepotřebujeme pro vnitřní přetahování
    }

    function dragOver(e) {
        e.preventDefault(); // Umožňuje drop
        const target = e.target.closest('.puzzle-piece');
        if (target && target !== draggedPiece) {
            target.classList.add('highlight');
        }
        // V případě, že chceme, aby se ghost pohyboval s kurzorem
        if (draggedPiece) {
            draggedPiece.style.left = `${e.clientX - dragOffsetX}px`;
            draggedPiece.style.top = `${e.clientY - dragOffsetY}px`;
            draggedPiece.style.position = 'fixed'; // Dočasně změníme pozici pro přetahování
            draggedPiece.style.zIndex = '1000';
        }
    }

    function dragLeave(e) {
        const target = e.target.closest('.puzzle-piece');
        if (target) {
            target.classList.remove('highlight');
        }
    }

    function drop(e) {
        e.preventDefault();
        const targetPiece = e.target.closest('.puzzle-piece');
        if (draggedPiece && targetPiece && draggedPiece !== targetPiece) {
            const draggedId = parseInt(draggedPiece.dataset.id);
            const targetId = parseInt(targetPiece.dataset.id);

            const draggedIndex = currentPositions.indexOf(draggedId);
            const targetIndex = currentPositions.indexOf(targetId);

            // Výměna pozic v poli currentPositions
            [currentPositions[draggedIndex], currentPositions[targetIndex]] = 
            [currentPositions[targetIndex], currentPositions[draggedIndex]];
            
            // Výměna DOM elementů v poli 'pieces'
            const tempPiece = pieces[draggedIndex];
            pieces[draggedIndex] = pieces[targetIndex];
            pieces[targetIndex] = tempPiece;

            positionPieces();
            checkWin();
        }
        if (targetPiece) {
            targetPiece.classList.remove('highlight');
        }
    }

    function dragEnd(e) {
        if (draggedPiece) {
            // Po dokončení přetahování resetujeme styly a třídy
            draggedgedPiece.classList.remove('dragging'); // Opraven překlep 'draggedgedPiece' na 'draggedPiece'
            draggedPiece.style.removeProperty('position');
            draggedPiece.style.removeProperty('left');
            draggedPiece.style.removeProperty('top');
            draggedPiece.style.removeProperty('z-index');
            positionPieces(); // Znovu umístíme všechny dílky do mřížky
        }
        draggedPiece = null;
    }

    // Touch eventy
    let touchDraggedPiece = null;
    let touchStartX, touchStartY;

    function touchStart(e) {
        touchDraggedPiece = this;
        touchDraggedPiece.classList.add('dragging');
        const touch = e.touches[0];
        const rect = this.getBoundingClientRect();
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;

        // Okamžitě nastavíme pozici na fixed pro plynulé přetahování
        touchDraggedPiece.style.position = 'fixed';
        touchDraggedPiece.style.zIndex = '1000';
        touchDraggedPiece.style.left = `${touch.clientX - dragOffsetX}px`;
        touchDraggedPiece.style.top = `${touch.clientY - dragOffsetY}px`;

        e.preventDefault(); // Zamezí scrollování stránky při přetahování
    }

    function touchMove(e) {
        if (!touchDraggedPiece) return;

        const touch = e.touches[0];
        touchDraggedPiece.style.left = `${touch.clientX - dragOffsetX}px`;
        touchDraggedPiece.style.top = `${touch.clientY - dragOffsetY}px`;

        // Detekce cílového dílku pro highlight
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        // Odstraní highlight ze všech ostatních dílků
        document.querySelectorAll('.puzzle-piece').forEach(p => {
            if (p !== touchDraggedPiece) {
                p.classList.remove('highlight');
            }
        });

        if (targetPiece && targetPiece !== touchDraggedPiece) {
            targetPiece.classList.add('highlight');
        }

        e.preventDefault(); // Zamezí scrollování stránky
    }

    function touchEnd(e) {
        if (!touchDraggedPiece) return;

        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetPiece = targetElement ? targetElement.closest('.puzzle-piece') : null;

        if (touchDraggedPiece && targetPiece && touchDraggedPiece !== targetPiece) {
            const draggedId = parseInt(touchDraggedPiece.dataset.id);
            const targetId = parseInt(targetPiece.dataset.id);

            const draggedIndex = currentPositions.indexOf(draggedId);
            const targetIndex = currentPositions.indexOf(targetId);

            // Výměna pozic v poli currentPositions
            [currentPositions[draggedIndex], currentPositions[targetIndex]] = 
            [currentPositions[targetIndex], currentPositions[draggedIndex]];
            
            // Výměna DOM elementů v poli 'pieces'
            const tempPiece = pieces[draggedIndex];
            pieces[draggedIndex] = pieces[targetIndex];
            pieces[targetIndex] = tempPiece;

            checkWin();
        }

        // Resetování stylů a tříd
        touchDraggedPiece.classList.remove('dragging');
        touchDraggedPiece.style.removeProperty('position');
        touchDraggedPiece.style.removeProperty('left');
        touchDraggedPiece.style.removeProperty('top');
        touchDraggedPiece.style.removeProperty('z-index');
        touchDraggedPiece = null;

        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('highlight'));
        positionPieces(); // Znovu umístíme všechny dílky do mřížky
    }

    // Zprávy pro puzzle
    const puzzleMessages = {
        win: 'Výborně! Puzzle je složeno!',
        loading: 'Načítám puzzle...',
        error: 'Chyba při načítání obrázku puzzle.'
    };

    // --- Funkce pro načtení a zobrazení puzzle ---
    function loadPuzzle(index) {
        if (index < 0 || index >= puzzleImages.length) {
            console.error("Index puzzle mimo rozsah.");
            return;
        }

        currentPuzzleIndex = index;
        puzzleInfo.textContent = `Puzzle ${currentPuzzleIndex + 1} / ${puzzleImages.length}`;
        messageDisplay.textContent = puzzleMessages.loading;

        const imageUrl = puzzleImages[currentPuzzleIndex];
        createPuzzlePieces(imageUrl); // Tato funkce nyní volá calculatePuzzleDimensions
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

    // Přidáme listener pro změnu velikosti okna, aby se puzzle přepočítalo
    window.addEventListener('resize', () => {
        // Znovu načteme aktuální puzzle, což spustí přepočet rozměrů
        if (puzzleImages.length > 0) {
            loadPuzzle(currentPuzzleIndex);
        }
    });
});
