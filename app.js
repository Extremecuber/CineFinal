const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const bucketName = process.env.S3_BUCKET_NAME;

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
            Prefix: 'images/' // Assuming images are stored under the 'images/' folder in your S3 bucket
        };

        const data = await s3.listObjectsV2(params).promise();
        const imageUrls = data.Contents.map(item => `https://${bucketName}.s3.amazonaws.com/${item.Key}`);
        res.json(imageUrls);
    } catch (error) {
        console.error('Failed to fetch images from S3', error);
        res.status(500).json({ error: 'Failed to fetch images from S3' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
