// Get all the draggable letters and squares
const letters = document.querySelectorAll('.letter');
const squares = document.querySelectorAll('.square');

let draggedLetter = null;

// Add event listeners for drag and drop
letters.forEach(letter => {
  letter.addEventListener('dragstart', dragStart);
  letter.addEventListener('dragend', dragEnd);
});

squares.forEach(square => {
  square.addEventListener('dragover', dragOver);
  square.addEventListener('drop', drop);
  square.addEventListener('dragleave', dragLeave);
});

function dragStart(event) {
  draggedLetter = event.target;
  setTimeout(() => {
    event.target.style.display = 'none'; // Hide the letter during drag
  }, 0);
}

function dragEnd(event) {
  setTimeout(() => {
    event.target.style.display = 'block'; // Show the letter after it's dropped
    draggedLetter = null;
  }, 0);
}

function dragOver(event) {
  event.preventDefault(); // Allow dropping
  event.target.classList.add('drag-over');
}

function dragLeave(event) {
  event.target.classList.remove('drag-over');
}

function drop(event) {
  event.preventDefault();
  const targetSquare = event.target;

  // Only drop if the square is empty
  if (!targetSquare.classList.contains('filled')) {
    targetSquare.classList.add('filled');
    targetSquare.textContent = draggedLetter.textContent;
    draggedLetter.style.display = 'none'; // Hide the letter after drop
    targetSquare.classList.remove('drag-over');
  }
}
