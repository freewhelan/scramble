// Get the elements for the letters and squares
const letters = document.querySelectorAll('.letter');
const squares = document.querySelectorAll('.square');

let draggedLetter = null;

// Add event listeners to the draggable letters
letters.forEach(letter => {
  letter.addEventListener('dragstart', dragStart);
  letter.addEventListener('dragend', dragEnd);
});

// Add event listeners to the squares
squares.forEach(square => {
  square.addEventListener('dragover', dragOver);
  square.addEventListener('drop', drop);
  square.addEventListener('dragleave', dragLeave);
});

function dragStart(event) {
  draggedLetter = event.target;
  setTimeout(() => {
    event.target.style.display = 'none'; // Hide the letter when it starts being dragged
  }, 0);
}

function dragEnd(event) {
  setTimeout(() => {
    event.target.style.display = 'block'; // Show the letter again after it is dropped
    draggedLetter = null;
  }, 0);
}

function dragOver(event) {
  event.preventDefault();
  event.target.classList.add('drag-over');
}

function dragLeave(event) {
  event.target.classList.remove('drag-over');
}

function drop(event) {
  event.preventDefault();
  const targetSquare = event.target;

  // Check if the drop target is a valid square and not already filled
  if (targetSquare.classList.contains('square') && targetSquare.textContent === '') {
    targetSquare.textContent = draggedLetter.textContent;
    draggedLetter.style.display = 'none'; // Hide the dragged letter after dropping
    targetSquare.classList.remove('drag-over');
  }
}
