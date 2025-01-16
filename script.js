const scrabblePoints = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const dictionary = ["CAT", "BAT", "DOG", "FAT", "TAG", "CAGE", "BAG", "BARK", "TACK"]; // Example dictionary

let targetScore = 0;
let yourScore = 0;
let availableLetters = ["A", "B", "C", "D", "E", "F", "G"];
let placedLetters = [];

const targetScoreElement = document.getElementById("target-score");
const yourScoreElement = document.getElementById("your-score");
const shuffleButton = document.getElementById("shuffle-btn");
const clearButton = document.getElementById("clear-btn");
const submitButton = document.getElementById("submit-btn");

const squares = document.querySelectorAll(".square");
const letters = document.querySelectorAll(".letter");

// Shuffle letters
shuffleButton.addEventListener("click", shuffleLetters);

// Clear placed letters
clearButton.addEventListener("click", clearSquares);

// Submit word
submitButton.addEventListener("click", submitWord);

// Initialize the game
function initGame() {
  updateTargetScore();
  updateLetterTiles();
  updateScores();
}

function updateLetterTiles() {
  letters.forEach((letter, index) => {
    letter.textContent = availableLetters[index];
    letter.setAttribute("data-letter", availableLetters[index]);
  });
}

function shuffleLetters() {
  availableLetters = availableLetters.sort(() => Math.random() - 0.5);
  updateLetterTiles();
}

function clearSquares() {
  placedLetters = [];
  squares.forEach(square => {
    square.textContent = '';
    square.classList.remove('filled');
  });
}

function submitWord() {
  const word = placedLetters.join('');
  if (isValidWord(word)) {
    yourScore = calculateScore(word);
    yourScoreElement.textContent = yourScore;
  } else {
    alert("Invalid word! Try again.");
  }
}

function isValidWord(word) {
  return dictionary.includes(word.toUpperCase());
}

function calculateScore(word) {
  return word.split('').reduce((score, letter) => score + scrabblePoints[letter.toUpperCase()], 0);
}

function updateTargetScore() {
  targetScore = calculateScore("CAGE"); // Example: maximum score word
  targetScoreElement.textContent = targetScore;
}

// Drag and Drop logic for letters
letters.forEach(letter => {
  letter.addEventListener("dragstart", dragStart);
  letter.addEventListener("dragend", dragEnd);
});

squares.forEach(square => {
  square.addEventListener("dragover", dragOver);
  square.addEventListener("drop", dropLetter);
});

function dragStart(event) {
  event.dataTransfer.setData("text", event.target.dataset.letter);
}

function dragEnd(event) {
  event.target.style.opacity = "1";
}

function dragOver(event) {
  event.preventDefault();
}

function dropLetter(event) {
  event.preventDefault();
  const letter = event.dataTransfer.getData("text");
  const square = event.target;

  if (!square.classList.contains('filled')) {
    square.classList.add('filled');
    square.textContent = letter;
    placedLetters.push(letter);
  }
}

initGame();
