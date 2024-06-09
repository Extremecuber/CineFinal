const frames = []; // Array to hold image URLs fetched from S3
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
    await loadImagesFromS3();
    updateMessage('Guess the Movie!');
};

async function getImagesFromS3() {
    try {
        const response = await fetch('/get-images');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched data from S3:', data); // Debugging step
            return data;
        } else {
            console.error('Failed to fetch images from S3');
            return [];
        }
    } catch (err) {
        console.error('Error fetching images from S3:', err);
        return [];
    }
}

// Use this function to get images from S3 and pass them to frames array
async function loadImagesFromS3() {
    try {
        const images = await getImagesFromS3();
        if (images.length > 0) {
            frames.push(...images);

            // Set the correct movie title and end game image path
            // This needs to be adapted based on your application's logic
            // For example, you might want to fetch movie details from another endpoint or structure your S3 objects accordingly
            correctMovie = 'Example Movie Title'; // Set the correct movie title dynamically
            endGameImage = frames[0]; // Set the end game image path

            // Set maxGuesses based on the number of frames
            maxGuesses = frames.length;

            // Display the first frame after images are loaded
            displayFrame(currentFrame);
        } else {
            updateMessage('No images found in the S3 bucket.', '#ff6f61');
        }
    } catch (error) {
        console.error('Error loading images from S3:', error);
        updateMessage('Failed to load images from the S3 bucket.', '#ff6f61');
    }
}
