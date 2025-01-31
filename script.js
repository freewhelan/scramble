class WordGame {
    constructor() {
        this.draggedTile = null;
        this.touchOffset = { x: 0, y: 0 };
        this.LETTER_POINTS = {
            'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
            'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
            'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
        };
        this.initializeGame();
        this.setupDragAndDrop();
        this.loadDictionary();
    }

    async loadDictionary() {
        // In a real implementation, you would load a dictionary file
        // For demo purposes, we'll use a small set of words
        this.dictionary = new Set(['CAT', 'DOG', 'BIRD', 'WORD', 'GAME']);
    }

    initializeGame() {
        this.todaysLetters = this.generateDailyLetters();
        this.maxScore = this.calculateMaxPossibleScore();
        this.currentScore = 0;
        this.createBoard();
        this.updateScoreBar();

        // Shuffle and Reset buttons
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleLetters());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetBoard());
    }

    generateDailyLetters() {
        const date = new Date();
        const seed = date.getFullYear() * 10000 + 
                   (date.getMonth() + 1) * 100 + 
                   date.getDate();
        
        const seededRandom = () => {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const consonants = Object.keys(this.LETTER_POINTS).filter(l => !vowels.includes(l));

        let letters = [];
        letters.push(vowels[Math.floor(seededRandom() * vowels.length)]);

        while (letters.length < 7) {
            const letter = seededRandom() < 0.3 && letters.filter(l => vowels.includes(l)).length < 4
                ? vowels[Math.floor(seededRandom() * vowels.length)]
                : consonants[Math.floor(seededRandom() * consonants.length)];
            letters.push(letter);
        }

        return letters;
    }

    calculateMaxPossibleScore() {
        return this.todaysLetters.reduce((sum, letter) => sum + this.LETTER_POINTS[letter], 0);
    }

    createBoard() {
        const scoreboard = document.getElementById('scoreboard');
        const lettersContainer = document.getElementById('letters-container');

        scoreboard.innerHTML = '';
        lettersContainer.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            if (i === 1) slot.classList.add('triple-letter');
            slot.dataset.index = i;
            scoreboard.appendChild(slot);
        }

        this.todaysLetters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.draggable = true;
            tile.innerHTML = `
                <span class="letter">${letter}</span>
                <span class="points">${this.LETTER_POINTS[letter]}</span>
            `;
            tile.dataset.letter = letter;
            lettersContainer.appendChild(tile);
        });
    }

    setupDragAndDrop() {
        document.querySelectorAll('.letter-tile').forEach(tile => {
            tile.addEventListener('dragstart', e => {
                this.draggedTile = tile;
                e.dataTransfer.setData('text/plain', tile.dataset.letter);
                setTimeout(() => tile.classList.add('dragging'), 0);
            });

            tile.addEventListener('dragend', () => {
                tile.classList.remove('dragging');
            });
        });

        document.querySelectorAll('.letter-tile').forEach(tile => {
            tile.addEventListener('touchstart', e => {
                e.preventDefault();
                this.draggedTile = tile;
                const touch = e.touches[0];
                const rect = tile.getBoundingClientRect();
                this.touchOffset = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
                tile.classList.add('dragging');
            });

            tile.addEventListener('touchmove', e => {
                if (!this.draggedTile) return;
                e.preventDefault();
                const touch = e.touches[0];
                this.draggedTile.style.left = `${touch.clientX - this.touchOffset.x}px`;
                this.draggedTile.style.top = `${touch.clientY - this.touchOffset.y}px`;
                
                const slots = document.querySelectorAll('.letter-slot');
                slots.forEach(slot => {
                    const rect = slot.getBoundingClientRect();
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        slot.classList.add('drag-over');
                    } else {
                        slot.classList.remove('drag-over');
                    }
                });
            });

            tile.addEventListener('touchend', e => {
                if (!this.draggedTile) return;
                e.preventDefault();
                const touch = e.changedTouches[0];
                const slots = document.querySelectorAll('.letter-slot');
                let dropped = false;

                slots.forEach(slot => {
                    const rect = slot.getBoundingClientRect();
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom &&
                        !slot.hasChildNodes()) {
                        slot.appendChild(this.draggedTile.cloneNode(true));
                        this.draggedTile.remove();
                        dropped = true;
                        this.checkWord();
                    }
                    slot.classList.remove('drag-over');
                });

                if (!dropped) {
                    this.draggedTile.style.left = '';
                    this.draggedTile.style.top = '';
                }
                this.draggedTile.classList.remove('dragging');
                this.draggedTile = null;
            });
        });

        document.querySelectorAll('.letter-slot').forEach(slot => {
            slot.addEventListener('dragover', e => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', e => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', e => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                if (!slot.hasChildNodes()) {
                    const letter = e.dataTransfer.getData('text/plain');
                    const tile = document.querySelector(`[data-letter="${letter}"]`);
                    slot.appendChild(tile.cloneNode(true));
                    tile.remove();
                    this.checkWord();
                }
            });
        });
    }

    checkWord() {
        const slots = document.querySelectorAll('.letter-slot');
        let word = '';
        let score = 0;

        slots.forEach((slot, index) => {
            if (slot.firstChild) {
                const letter = slot.firstChild.dataset.letter;
                word += letter;
                let points = this.LETTER_POINTS[letter];
                if (index === 1) points *= 3; // Triple letter score
                score += points;
            }
        });

        if (word && this.dictionary.has(word)) {
            this.currentScore = score;
            this.updateScoreBar();
            if (score === this.maxScore) this.showFireworks();
        }
    }

    updateScoreBar() {
        const fillElement = document.getElementById('score-fill');
        const textElement = document.getElementById('score-text');
        const percentage = (this.currentScore / this.maxScore) * 100;
        
        fillElement.style.width = `${percentage}%`;
        textElement.textContent = `${this.currentScore} / ${this.maxScore}`;
    }

    showFireworks() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createFirework(), i * 300);
        }
    }

    createFirework() {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${Math.random() * 100}vw`;
        firework.style.top = `${Math.random() * 100}vh`;
        document.body.appendChild(firework);

        setTimeout(() => firework.remove(), 1000);
    }

    shuffleLetters() {
        this.todaysLetters.sort(() => Math.random() - 0.5);
        this.createBoard();
        this.setupDragAndDrop();
    }

    resetBoard() {
        this.createBoard();
        this.setupDragAndDrop();
        this.currentScore = 0;
        this.updateScoreBar();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});
