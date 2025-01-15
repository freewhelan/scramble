document.addEventListener('DOMContentLoaded', function () {
    // Scrabble letter points mapping
    const scrabblePoints = {
        A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
        M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4,
        X: 8, Y: 4, Z: 10
    };

    const letterContainer = document.getElementById('letters');
    const totalPointsElement = document.getElementById('total-points');
    const clearButton = document.getElementById('clear-btn');
    const shuffleButton = document.getElementById('shuffle-btn');
    const blankSpaces = document.querySelectorAll('.blank-space');
    let totalPoints = 0;
    let lettersInPlay = []; // Track letters that are in the blank spaces
    let validWords = []; // List to store valid words fetched from the source

    // Fetch the word list from the public GitHub repository
    async function fetchWordList() {
        const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words.txt');
        const words = await response.text();
        validWords = words.split('\n').map(word => word.trim().toLowerCase());
    }

    // Scrabble letter frequency (based on the Scrabble distribution)
    const letterFrequency = {
        A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1,
        L: 4, M: 2, N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2,
        W: 2, X: 1, Y: 2, Z: 1
    };

    // Generate random letters based on the current date
    function getRandomLetters() {
        const availableLetters = Object.keys(letterFrequency);
        const lettersForGame = [];
        const currentDate = new Date();
        const seed = currentDate.getDate();  // Use the current day as the "seed"

        // Pseudo-randomly select 7 letters based on the seed
        for (let i = 0; i < 7; i++) {
            const index = (seed + i) % availableLetters.length;
            const letter = availableLetters[index];
            lettersForGame.push(letter);
        }

        return lettersForGame;
    }

    // Function to create letter elements
    function createLetters() {
        const letters = getRandomLetters(); // Get 7 random letters
        letters.forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.classList.add('letter');
            letterElement.textContent = letter;

            // Create point value element and append to the letter tile
            const pointValue = scrabblePoints[letter];
            const pointElement = document.createElement('span');
            pointElement.classList.add('point-value');
            pointElement.textContent = pointValue;

            letterElement.appendChild(pointElement);
            letterElement.setAttribute('draggable', 'true');

            // Add event listener for drag start
            letterElement.addEventListener('dragstart', dragStart);
            letterContainer.appendChild(letterElement);
        });
    }

    // Handle drag start event
    function dragStart(e) {
        e.dataTransfer.setData('text', e.target.textContent);
    }

    // Function to allow dropping of letters into blank spaces
    function allowDrop(e) {
        e.preventDefault();
    }

    // Handle drop event
    function drop(e) {
        e.preventDefault();
        const droppedLetter = e.dataTransfer.getData('text');
        const targetSpace = e.target;

        // Only allow drop in empty spaces
        if (targetSpace.textContent === '') {
            targetSpace.textContent = droppedLetter; // Place the letter in the blank space
            targetSpace.style.borderColor = 'green'; // Change border to indicate it's filled
            targetSpace.classList.add('filled'); // Add a filled class to ensure consistency in style

            // Add the dropped letter to the list of letters in play
            lettersInPlay.push(droppedLetter);
        }
    }

    // Function to calculate points based on Scrabble letter values
    function calculatePoints(word) {
        let wordPoints = 0;
        for (let letter of word) {
            wordPoints += scrabblePoints[letter.toUpperCase()] || 0; // Get points for the letter
        }
        return wordPoints;
    }

    // Validate if the formed word is a valid English word (check against the fetched list)
    function isValidWord(word) {
        return validWords.includes(word.toLowerCase());
    }

    // Handle the shuffle button
    shuffleButton.addEventListener('click', function () {
        const letterElements = document.querySelectorAll('.letter');
        const letterArray = Array.from(letterElements);
        letterArray.sort(() => Math.random() - 0.5); // Shuffle the array
        letterContainer.innerHTML = ''; // Clear current letters
        letterArray.forEach(letterElement => {
            letterContainer.appendChild(letterElement); // Reorder shuffled letters
        });
    });

    // Clear the game
    clearButton.addEventListener('click', function () {
        blankSpaces.forEach(space => {
            space.textContent = '';
            space.style.borderColor = '#ccc'; // Reset border color
            space.classList.remove('filled'); // Remove filled class
        });
        totalPoints = 0; // Reset points
        totalPointsElement.textContent = totalPoints;
        lettersInPlay = []; // Clear letters in play
    });

    // Check if the word is valid and calculate points
    function checkWordAndCalculatePoints() {
        const word = lettersInPlay.join('');
        if (isValidWord(word)) {
            const points = calculatePoints(word);
            totalPoints += points;
            totalPointsElement.textContent = totalPoints;
        } else {
            alert("Not a valid word!");
        }
    }

    // Setup the droppable blank spaces
    function setupDropZones() {
        blankSpaces.forEach(space => {
            space.addEventListener('dragover', allowDrop); // Allow drag over
            space.addEventListener('drop', drop); // Handle drop
        });
    }

    // Initialize game
    fetchWordList().then(() => {
        createLetters();
        setupDropZones();
    });
});
