const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const path = require('path');
const config = require('./config'); // Import the configuration

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK using values from config.js
const s3 = new AWS.S3({
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
});
const bucketName = config.s3BucketName;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-images', async (req, res) => {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: '' // Change this to the folder name if your images are in a specific folder, e.g., 'images/'
        };

        const data = await s3.listObjectsV2(params).promise();
        const imageUrls = data.Contents.map(item => `https://${bucketName}.s3.${config.awsRegion}.amazonaws.com/${item.Key}`);
        res.json(imageUrls);
    } catch (error) {
        console.error('Failed to fetch images from S3', error);
        res.status(500).json({ error: 'Failed to fetch images from S3' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
