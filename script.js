class WordGame {
    constructor() {
        this.draggedTile = null;
        this.touchOffset = { x: 0, y: 0 };
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
    }

    generateDailyLetters() {
        const LETTER_POINTS = {
            'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
            'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
            'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
        };

        const LETTER_DISTRIBUTION = {
            'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12, 'F': 2, 'G': 3, 'H': 2, 'I': 9,
            'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8, 'P': 2, 'Q': 1, 'R': 6,
            'S': 4, 'T': 6, 'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2, 'Z': 1
        };

        // Use the current date as seed
        const date = new Date();
        const seed = date.getFullYear() * 10000 + 
                   (date.getMonth() + 1) * 100 + 
                   date.getDate();
        
        // Seeded random number generator
        const seededRandom = () => {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        let letters = [];
        let vowels = ['A', 'E', 'I', 'O', 'U'];
        let consonants = Object.keys(LETTER_POINTS).filter(l => !vowels.includes(l));

        // Ensure at least one vowel
        letters.push(vowels[Math.floor(seededRandom() * vowels.length)]);

        // Fill remaining slots
        while (letters.length < 7) {
            const letter = seededRandom() < 0.3 && letters.filter(l => vowels.includes(l)).length < 4
                ? vowels[Math.floor(seededRandom() * vowels.length)]
                : consonants[Math.floor(seededRandom() * consonants.length)];
            letters.push(letter);
        }

        return letters;
    }

    calculateMaxPossibleScore() {
        const LETTER_POINTS = {
            'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
            'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
            'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
        };
        return this.todaysLetters.reduce((sum, letter) => sum + LETTER_POINTS[letter], 0);
    }

    createBoard() {
        const scoreboard = document.getElementById('scoreboard');
        const lettersContainer = document.getElementById('letters-container');

        // Clear existing elements
        scoreboard.innerHTML = '';
        lettersContainer.innerHTML = '';

        // Create scoreboard slots
        for (let i = 0; i < 7; i++) {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            if (i === 1) slot.classList.add('triple-letter');
            slot.dataset.index = i;
            scoreboard.appendChild(slot);
        }

        // Create letter tiles
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
        // Mouse events
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

        // Touch events
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
                
                // Check if over a slot
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

        // Slot events
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
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});
