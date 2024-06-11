const express = require('express');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_BUCKET_NAME;

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
            Bucket: bucketName,
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
