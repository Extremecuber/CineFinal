const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_BUCKET_NAME;

app.get('/get-movies', async (req, res) => {
    try {
        const listParams = {
            Bucket: bucketName,
            Delimiter: '/'
        };

        const data = await s3.listObjectsV2(listParams).promise();
        const folders = data.CommonPrefixes.map(prefix => prefix.Prefix);
        res.json(folders);
    } catch (err) {
        console.error('Error listing folders:', err);
        res.status(500).send('Error listing folders');
    }
});

app.get('/get-images/:folder', async (req, res) => {
    try {
        const folderName = req.params.folder;
        const listParams = {
            Bucket: bucketName,
            Prefix: folderName
        };

        const data = await s3.listObjectsV2(listParams).promise();
        const imageKeys = data.Contents.map(content => content.Key).sort();
        const imageUrls = imageKeys.map(key => s3.getSignedUrl('getObject', { Bucket: bucketName, Key: key }));

        res.json(imageUrls);
    } catch (err) {
        console.error('Error listing images:', err);
        res.status(500).send('Error listing images');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
