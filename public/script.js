const frames = [];
let correctMovie = '';
let endGameImage = '';
let currentFrame = 0;
let guesses = 0;
let maxGuesses = 0;

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

    document.getElementById('submitGuess').disabled = false;
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
        displayEndGameMessage('Congratulations! You guessed it!', endGameImage);
        return;
    }

    if (guesses >= maxGuesses) {
        displayEndGameMessage(`Sorry, you've used all your guesses. The correct movie was "${correctMovie}".`, endGameImage);
        return;
    }

    document.getElementById('guessInput').value = '';

    currentFrame++;
    displayFrame(currentFrame);
    createButton(currentFrame);
    toggleFrame(currentFrame);
    updateMessage(`Incorrect! You have ${maxGuesses - guesses} guesses left.`, '#ff6347');
}

function skipFrame() {
    guesses++;
    if (guesses >= maxGuesses) {
        displayEndGameMessage(`Sorry, you've used all your guesses. The correct movie was "${correctMovie}".`, endGameImage);
        return;
    }
    document.getElementById('guessInput').value = '';
    currentFrame++;
    displayFrame(currentFrame);
    createButton(currentFrame);
    toggleFrame(currentFrame);
    updateMessage(`Frame skipped! You have ${maxGuesses - guesses} guesses left.`, '#ff6347');
}

function displayEndGameMessage(message, imagePath) {
    const body = document.body;
    body.innerHTML = '';

    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    messageElement.style.color = '#28a745';
    messageElement.style.fontSize = '2em';
    messageElement.style.marginTop = '20px';

    const imageElement = document.createElement('img');
    imageElement.src = imagePath;
    imageElement.alt = 'End Game Image';
    imageElement.style.width = '50%';
    imageElement.style.height = 'auto';
    imageElement.style.marginTop = '20px';

    body.appendChild(messageElement);
    body.appendChild(imageElement);
}

window.onload = async () => {
    await loadImagesFromS3();
    updateMessage('Guess the Movie!');
};

async function getMoviesFromS3() {
    try {
        const response = await fetch('/get-movies');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched folders from S3:', data);
            return data;
        } else {
            console.error('Failed to fetch folders from S3');
            return null;
        }
    } catch (err) {
        console.error('Failed to fetch folders from S3', err);
        return null;
    }
}

async function getImagesFromS3(folder) {
    try {
        const response = await fetch(`/get-images/${folder}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched images from S3:', data);
            return data;
        } else {
            console.error('Failed to fetch images from S3');
            return null;
        }
    } catch (err) {
        console.error('Failed to fetch images from S3', err);
        return null;
    }
}

async function loadImagesFromS3() {
    try {
        const folders = await getMoviesFromS3();
        if (folders && folders.length > 0) {
            const randomFolder = folders[Math.floor(Math.random() * folders.length)];
            console.log('Randomly selected folder:', randomFolder);

            const images = await getImagesFromS3(randomFolder);
            if (images && images.length > 0) {
                frames.push(...images);

                correctMovie = randomFolder.replace('/', ''); // Assuming folder names are movie titles
                console.log('Correct movie title:', correctMovie);

                endGameImage = images[images.length - 1]; // Assuming last image is the end game image
                console.log('End game image path:', endGameImage);

                maxGuesses = frames.length - 1;

                displayFrame(currentFrame);
            } else {
                updateMessage('No images found in the selected folder.', '#ff6f61');
            }
        } else {
            updateMessage('No folders found in the bucket.', '#ff6f61');
        }
    } catch (error) {
        console.error('Error loading images from S3:', error);
        updateMessage('Failed to load images from the bucket.', '#ff6f61');
    }
}
