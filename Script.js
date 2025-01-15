const lettersContainer = document.querySelector('.letters');
const slots = document.querySelectorAll('.slot');
const totalPointsSpan = document.getElementById('totalPoints');
const checkWordBtn = document.getElementById('checkWordBtn');
const messageDiv = document.getElementById('message');

const letterData = [
    { letter: 'A', points: 1 },
    { letter: 'B', points: 3 },
    { letter: 'C', points: 3 },
    { letter: 'D', points: 2 },
    { letter: 'E', points: 1 },
    { letter: 'F', points: 4 },
    { letter: 'G', points: 2 },
];

// Function to create the letter tiles
function createLetterTiles() {
    letterData.forEach(data => {
        const letterDiv = document.createElement('div');
        letterDiv.textContent = data.letter;
        letterDiv.classList.add('letter');
        letterDiv.setAttribute('draggable', 'true');
        letterDiv.setAttribute('data-letter', data.letter);
        letterDiv.setAttribute('data-points', data.points);
        letterDiv.addEventListener('dragstart', handleDragStart);
        lettersContainer.appendChild(letterDiv);
    });
}

// Dragging functionality
function handleDragStart(e) {
    e.dataTransfer.setData('text', e.target.dataset.letter);
    e.dataTransfer.setData('points', e.target.dataset.points);
}

// Allow dropping on the slots
slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', handleDrop);
});

// Handle the drop event
function handleDrop(e) {
    const letter = e.dataTransfer.getData('text');
    const points = e.dataTransfer.getData('points');
    const targetSlot = e.target;
    
    if (targetSlot.textContent === '') {
        targetSlot.textContent = letter;
        targetSlot.dataset.points = points;
    }
}

// Check word validity and calculate points
checkWordBtn.addEventListener('click', () => {
    const currentWord = Array.from(slots).map(slot => slot.textContent).join('');
    if (currentWord.length === 7 && isValidWord(currentWord)) {
        let totalPoints = 0;
        slots.forEach(slot => {
            totalPoints += parseInt(slot.dataset.points || 0);
        });
        totalPointsSpan.textContent = totalPoints;
        messageDiv.textContent = `Valid Word! Points: ${totalPoints}`;
    } else {
        messageDiv.textContent = 'Invalid word. Please try again.';
    }
});

// Dummy word validation function (can be replaced with actual dictionary check)
function isValidWord(word) {
    const validWords = ['ABCDEFA', 'BCDEFGH', 'ABCDEFG']; // Example valid words
    return validWords.includes(word);
}

// Initialize the game
createLetterTiles();
