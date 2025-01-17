const tileValues = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1,
    P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};
const vowels = ['A', 'E', 'I', 'O', 'U'];
let letters = [];
let blankSpaces = [];
let targetScore = 0;
let userScore = 0;

// Generate a random set of 7 letters based on Scrabble tile distribution
function generateLetters() {
    const letterPool = [
        'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 
        'F', 'F', 'G', 'G', 'H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'J', 'K', 'L', 'L', 'L', 'L', 'M', 'M', 'N', 
        'N', 'N', 'N', 'O', 'O', 'O', 'O', 'O', 'P', 'P', 'Q', 'R', 'R', 'R', 'R', 'S', 'S', 'S', 'S', 'T', 'T', 'T', 
        'T', 'U', 'U', 'U', 'V', 'V', 'W', 'W', 'X', 'Y', 'Y', 'Z'
    ];
    letters = [];
    while (letters.length < 7) {
        const randLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
        letters.push(randLetter);
    }

    // Ensure at least one vowel and max 4 vowels
    const numVowels = letters.filter(letter => vowels.includes(letter)).length;
    if (numVowels < 1 || numVowels > 4) {
        generateLetters(); // Regenerate if condition isn't met
    } else {
        displayLetters();
        calculateTargetScore();
    }
}

// Display the generated tiles
function displayLetters() {
    const tilesContainer = document.getElementById('tiles');
    tilesContainer.innerHTML = '';
    letters.forEach(letter => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.draggable = true;
        tile.textContent = letter;
        tile.addEventListener('dragstart', handleDragStart);
        const points = tileValues[letter];
        const pointsSpan = document.createElement('span');
        pointsSpan.textContent = points;
        tile.appendChild(pointsSpan);
        tilesContainer.appendChild(tile);
    });
}

// Handle drag start event for letters
function handleDragStart(e) {
    e.dataTransfer.setData('text', e.target.textContent);
}

// Handle drag over event for blank spaces
function handleDragOver(e) {
    e.preventDefault();
}

// Handle drop event for blank spaces
function handleDrop(e) {
    e.preventDefault();
    const letter = e.dataTransfer.getData('text');
    if (e.target.textContent === '') {
        e.target.textContent = letter;
        blankSpaces.push(letter);
        calculateUserScore();
    }
}

// Display blank spaces for the player to form words
function displayBlankSpaces() {
    const blankSpacesContainer = document.getElementById('blank-spaces');
    blankSpacesContainer.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const space = document.createElement('div');
        space.classList.add('blank-space');
        space.addEventListener('dragover', handleDragOver);
        space.addEventListener('drop', handleDrop);
        blankSpacesContainer.appendChild(space);
    }
}

// Calculate the highest possible score from the tiles (target score)
function calculateTargetScore() {
    const validWords = ['sample', 'example']; // Replace with a dictionary API or words array
    let maxScore = 0;
    validWords.forEach(word => {
        const score = word.split('').reduce((acc, letter) => acc + tileValues[letter.toUpperCase()], 0);
        maxScore = Math.max(maxScore, score);
    });
    targetScore = maxScore;
    document.getElementById('target-score').textContent = targetScore;
}

// Calculate the user's score for the word formed
function calculateUserScore() {
    const word = blankSpaces.join('');
    const score = word.split('').reduce((acc, letter) => acc + tileValues[letter.toUpperCase()], 0);
    userScore = score;
    document.getElementById('your-score').textContent = userScore;
}

// Shuffle the tiles
function shuffleTiles() {
    letters = letters.sort(() => Math.random() - 0.5);
    displayLetters();
}

// Clear the blank spaces
function clearWord() {
    blankSpaces = [];
    const blankSpacesContainer = document.getElementById('blank-spaces');
    const blankSpacesDivs = blankSpacesContainer.querySelectorAll('.blank-space');
    blankSpacesDivs.forEach(space => space.textContent = '');
    calculateUserScore();
}

// Initialize the game
function initGame() {
    generateLetters();
    displayBlankSpaces();
}

document.getElementById('shuffle-btn').addEventListener('click', shuffleTiles);
document.getElementById('clear-btn').addEventListener('click', clearWord);

initGame();
