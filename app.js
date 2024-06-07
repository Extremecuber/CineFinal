const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const uri = 'mongodb://localhost:27017';  // Connection string
const dbName = 'Cinedle';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
}

connectToMongoDB();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/connect-to-mongodb', async (req, res) => {
    try {
        if (!db) await connectToMongoDB();
        res.status(200).send('Connected to MongoDB');
    } catch (error) {
        res.status(500).send('Failed to connect to MongoDB');
    }
});

app.get('/get-images', async (req, res) => {
    try {
        const movies = await db.collection('movies2').find().toArray();
        console.log('Movies fetched from MongoDB:', movies); // Log the fetched data
        res.json(movies);
    } catch (error) {
        console.error('Failed to fetch images from MongoDB', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
