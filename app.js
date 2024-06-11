const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();

// Log environment variables to ensure they are set
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

// Ensure environment variables are loaded
if (!process.env.AWS_BUCKET_NAME) {
    console.error('Error: AWS_BUCKET_NAME environment variable is not set');
    process.exit(1);
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_BUCKET_NAME;

// Test S3 connection (optional, can be removed after confirming it works)
const listParams = {
    Bucket: bucketName,
    Delimiter: '/'
};

s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Success:', data);
    }
});

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-movies', async (req, res) => {
    try {
        const listParams = {
            Bucket: bucketName,
            Delimiter: '/'
        };
        const data = await s3.listObjectsV2(listParams).promise();
        const folders = data.CommonPrefixes.map(prefix => prefix.Prefix.slice(0, -1)); // Remove trailing '/'
        res.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Error fetching folders' });
    }
});

app.get('/get-images', async (req, res) => {
    const folder = req.query.folder;
    try {
        const listParams = {
            Bucket: `${bucketName}`,
            Prefix: `${folder}/`
        };
        const data = await s3.listObjectsV2(listParams).promise();
        const frames = data.Contents.map(item => s3.getSignedUrl('getObject', { Bucket: bucketName, Key: item.Key }));
        const endGameImage = frames.pop(); // Assuming last image is the end game image
        res.json({ frames, endGameImage });
    } catch (error) {
        console.error('Error fetching images from folder:', error);
        res.status(500).json({ error: 'Error fetching images from folder' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
