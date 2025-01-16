// Global variables
let letters = [];
let targetScore = 0;
let userScore = 0;
const letterPoints = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
    M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
    Y: 4, Z: 10
};

// Fetch the daily letters and calculate the target score (high score possible)
function fetchDailyLetters() {
    // Assuming you have a backend API that returns a set of random 7 letters
    // Example: ["A", "T", "E", "O", "S", "R", "M"]
    fetch('/api/daily-letters')
        .then(response => response.json())
        .then(data => {
            letters = data.letters;
            targetScore = calculateTargetScore(letters);
            userScore = 0;
            updateUI();
        });
}

// Calculate the target score from the provided letters
function calculateTargetScore(letters) {
    // You can generate all possible valid words from the letters
    // and calculate their scores, for now just returning a placeholder value
    return 20;  // Replace with actual target score logic
}

// Update the UI with the letters and scores
function updateUI() {
    const tileContainer = document.getElementById('tile-container');
    const blankSpaces = document.getElementById('blank-spaces');
    
    // Clear previous tiles
    tileContainer.innerHTML = '';
    blankSpaces.innerHTML = '';

    // Display the letter tiles
    letters.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.textContent = letter;
        tile.setAttribute('draggable', true);
        tile.dataset.index = index;
        tile.addEventListener('dragstart', handleDragStart);
        tileContainer.appendChild(tile);
    });

    // Create the blank spaces
    for (let i = 0; i < 7; i++) {
        const blankSpace = document.createElement('div');
        blankSpace.classList.add('blank-space');
        blankSpace.dataset.index = i;
        blankSpace.addEventListener('dragover', handleDragOver);
        blankSpace.addEventListener('drop', handleDrop);
        blankSpaces.appendChild(blankSpace);
    }

    // Update scores
    document.getElementById('target-score').textContent = targetScore;
    document.getElementById('user-score').textContent = userScore;
}

// Drag and drop handlers
function handleDragStart(e) {
    e.dataTransfer.setData('text', e.target.dataset.index);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text');
    const targetIndex = e.target.dataset.index;

    const draggedTile = document.querySelector(`.tile[data-index='${draggedIndex}']`);
    const targetSpace = document.querySelector(`.blank-space[data-index='${targetIndex}']`);

    if (!targetSpace.textContent) {
        targetSpace.textContent = draggedTile.textContent;
        draggedTile.style.display = 'none';  // Hide the dragged tile
    }
}

// Shuffle the letters
document.getElementById('shuffle').addEventListener('click', () => {
    letters = letters.sort(() => Math.random() - 0.5);
    updateUI();
});

// Clear the board
document.getElementById('clear').addEventListener('click', () => {
    const blankSpaces = document.querySelectorAll('.blank-space');
    blankSpaces.forEach(space => space.textContent = '');
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.style.display = 'block');
    userScore = 0;
    updateUI();
});

// Submit the word
document.getElementById('submit').addEventListener('click', () => {
    const word = Array.from(document.querySelectorAll('.blank-space'))
        .map(space => space.textContent)
        .join('');

    if (word.length < 2) {
        alert('Word must be at least 2 letters!');
        return;
    }

    fetch(`/api/validate-word?word=${word}`)
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                userScore = calculateWordScore(word);
            } else {
                alert('Invalid word');
            }
            updateUI();
        });
});

// Calculate the score of a word
function calculateWordScore(word) {
    return word.split('').reduce((score, letter) => {
        return score + (letterPoints[letter.toUpperCase()] || 0);
    }, 0);
}

// Initial setup
fetchDailyLetters();
