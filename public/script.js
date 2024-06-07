const frames = []; // Array to hold image paths fetched from MongoDB
let correctMovie = '';  // Correct movie title will be dynamically set
let endGameImage = '';  // End game image path will be dynamically set
let currentFrame = 0;
let guesses = 0;
let maxGuesses = 0; // Initialize maxGuesses to 0

function displayFrame(index) {
    const existingFrame = document.getElementById(`frame${index}`);
    if (existingFrame) {
        toggleFrame(index);
        return;
    }

    const frameDiv = document.createElement('div');
    frameDiv.className = 'frame';
    frameDiv.style.backgroundImage = `url(${frames[index]})`;
    frameDiv.id = `frame${index}`;
    if (index !== 0) {
        frameDiv.classList.add('hidden');
    }
    document.getElementById('frames').appendChild(frameDiv);

    if (index === 0) {
        createButton(index);
    }

    document.getElementById('submitGuess').disabled = false; // Enable submit button when showing a new frame
}

function createButton(index) {
    const button = document.createElement('button');
    button.innerText = index + 1;
    button.onclick = () => toggleFrame(index);
    document.getElementById('buttons').appendChild(button);
}

function toggleFrame(index) {
    const frameElements = document.querySelectorAll('.frame');
    frameElements.forEach((frame, i) => {
        frame.classList.toggle('hidden', i !== index);
    });
}

function updateMessage(text, color = '#28a745') {
    const messageElement = document.getElementById('message');
    messageElement.innerText = text;
    messageElement.style.color = color;
}

function makeGuess() {
    const userGuess = document.getElementById('guessInput').value.trim();
    guesses++;

    if (!userGuess) {
        updateMessage('Please enter your guess.', '#ff6f61');
        return;
    }

    if (userGuess.toLowerCase() === correctMovie.toLowerCase()) {
        displayEndGameMessage('Congratulations! You guessed it!', endGameImage); // Use dynamically fetched end game image
        return;
    }

    if (guesses >= maxGuesses) {
        displayEndGameMessage(`Sorry, you've used all your guesses. The correct movie was "${correctMovie}".`, endGameImage); // Use dynamically fetched end game image
        return;
    }

    document.getElementById('guessInput').value = '';

    currentFrame++;
    displayFrame(currentFrame);
    createButton(currentFrame);
    toggleFrame(currentFrame);
    updateMessage(`Incorrect! You have ${maxGuesses - guesses} guesses left.`, '#ff6347'); // Changed to a more visible color
}

function skipFrame() {
    guesses++;
    if (guesses >= maxGuesses) {
        displayEndGameMessage(`Sorry, you've used all your guesses. The correct movie was "${correctMovie}".`, endGameImage); // Use dynamically fetched end game image
        return;
    }
    document.getElementById('guessInput').value = '';
    currentFrame++;
    displayFrame(currentFrame);
    createButton(currentFrame);
    toggleFrame(currentFrame);
    updateMessage(`Frame skipped! You have ${maxGuesses - guesses} guesses left.`, '#ff6347'); // Changed to a more visible color
}

// Function to display the end game message with image
function displayEndGameMessage(message, imagePath) {
    const body = document.body;
    body.innerHTML = ''; // Clear the entire content of the body

    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    messageElement.style.color = '#28a745'; // Success color
    messageElement.style.fontSize = '2em';
    messageElement.style.marginTop = '20px';

    const imageElement = document.createElement('img');
    imageElement.src = imagePath;
    imageElement.alt = 'End Game Image';
    imageElement.style.width = '50%'; // Adjust as needed
    imageElement.style.height = 'auto'; // Maintain aspect ratio
    imageElement.style.marginTop = '20px';

    body.appendChild(messageElement);
    body.appendChild(imageElement);
}

window.onload = async () => {
    await loadImagesFromMongoDB();
    updateMessage('Guess the Movie!');
};

async function connectToMongoDB() {
    try {
        const response = await fetch('/connect-to-mongodb');
        if (response.ok) {
            console.log('Connected to MongoDB');
            return true;
        } else {
            console.error('Failed to connect to MongoDB');
            return false;
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        return false;
    }
}

async function getImagesFromMongoDB() {
    try {
        const response = await fetch('/get-images');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched data from MongoDB:', data); // Debugging step
            return data;
        } else {
            console.error('Failed to fetch images from MongoDB');
            return null;
        }
    } catch (err) {
        console.error('Failed to fetch images from MongoDB', err);
        return null;
    }
}

// Use this function to get images from MongoDB and pass them to frames array
async function loadImagesFromMongoDB() {
    if (await connectToMongoDB()) {
        const data = await getImagesFromMongoDB();
        if (data) {
            // Ensure there are movies available
            if (data.length === 0) {
                updateMessage('No movies found in the database.', '#ff6f61');
                return;
            }

            // Randomly select a movie
            const randomMovie = data[Math.floor(Math.random() * data.length)];
            console.log('Randomly selected movie:', randomMovie); // Debugging step

            // Set the correct movie title
            correctMovie = randomMovie.title;
            console.log('Correct movie title:', correctMovie); // Debugging step

            // Set the end game image path
            endGameImage = randomMovie.endGameImage;
            console.log('End game image path:', endGameImage); // Debugging step

            // Set maxGuesses based on the number of frames
            maxGuesses = randomMovie.frames.length;

            // Push frames to the frames array
            frames.push(...randomMovie.frames);
            console.log('Frames array:', frames); // Debugging step

            // Display the first frame after images are loaded
            displayFrame(currentFrame);
        } else {
            updateMessage('Failed to load movies from the database.', '#ff6f61');
        }
    } else {
        updateMessage('Failed to connect to the database.', '#ff6f61');
    }
}
