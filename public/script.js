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

    createButton(index);
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
        displayEndGameMessage('Congratulations! You guessed it!', endGameImage);
        return;
    }

    if (guesses >= maxGuesses) {
        displayEndGameMessage(`Sorry, you've used all your guesses. The correct movie was "${correctMovie}".`, endGameImage);
        return;
    }

    document.getElementById('guessInput').value = '';

    currentFrame++;
    if (currentFrame < frames.length) {
        displayFrame(currentFrame);
        toggleFrame(currentFrame);
    }
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
    if (currentFrame < frames.length) {
        displayFrame(currentFrame);
        toggleFrame(currentFrame);
    }
    updateMessage(`Frame skipped! You have ${maxGuesses - guesses} guesses left.`, '#ff6347');
}

function displayEndGameMessage(message, imagePath) {
    const body = document.body;
    body.innerHTML = ''; // Clear the entire content of the body

    const container = document.createElement('div');
    container.className = 'end-game-container';

    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    messageElement.style.fontSize = '2em';
    messageElement.style.marginTop = '20px';

    const imageElement = document.createElement('img');
    imageElement.src = imagePath;
    imageElement.alt = 'End Game Image';

    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = 'Play Again';
    playAgainButton.className = 'play-again-button';
    playAgainButton.onclick = () => {
        location.reload(); // Reload the page to start a new game
    };

    container.appendChild(messageElement);
    container.appendChild(imageElement);
    container.appendChild(playAgainButton);

    body.appendChild(container);
}

window.onload = async () => {
    await loadImagesFromS3();
    updateMessage('Guess the Movie!');

    // Add event listener for Enter key in guessInput
    document.getElementById('guessInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            makeGuess();
        }
    });
};

async function loadImagesFromS3() {
    try {
        const response = await fetch('/get-movies');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched folders from S3:', data); // Debugging step

            if (data && data.length > 0) {
                // Randomly select a folder
                const randomFolder = data[Math.floor(Math.random() * data.length)];
                console.log('Randomly selected folder:', randomFolder); // Debugging step

                // Fetch images from the selected folder
                const imagesResponse = await fetch(`/get-images?folder=${randomFolder}`);
                if (imagesResponse.ok) {
                    const imagesData = await imagesResponse.json();
                    console.log('Fetched images from selected folder:', imagesData); // Debugging step

                    if (imagesData && imagesData.frames.length > 0) {
                        frames.push(...imagesData.frames);

                        // Set the correct movie title
                        correctMovie = randomFolder; // Assuming the folder name is the movie title
                        console.log('Correct movie title:', correctMovie); // Debugging step

                        // Set the end game image path
                        endGameImage = imagesData.endGameImage;
                        console.log('End game image path:', endGameImage); // Debugging step

                        // Set maxGuesses based on the number of frames
                        maxGuesses = imagesData.frames.length;

                        // Display the first frame after images are loaded
                        displayFrame(currentFrame);
                    } else {
                        updateMessage('No images found in the selected folder.', '#ff6f61');
                    }
                } else {
                    console.error('Failed to fetch images from the selected folder');
                    updateMessage('Failed to load images from the selected folder.', '#ff6f61');
                }
            } else {
                updateMessage('No folders found in the bucket.', '#ff6f61');
            }
        } else {
            console.error('Failed to fetch folders from S3');
            updateMessage('Failed to load folders from S3.', '#ff6f61');
        }
    } catch (error) {
        console.error('Error fetching folders or images from S3:', error);
        updateMessage('Failed to load data from S3.', '#ff6f61');
    }
}
