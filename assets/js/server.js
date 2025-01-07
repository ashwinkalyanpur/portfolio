const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// MongoDB connection string
const uri = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/webTracker?retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.use(cors());
app.use(bodyParser.json());

// API to track page visits
app.post('/track', async (req, res) => {
    const { page } = req.body;

    try {
        await client.connect();
        const db = client.db('webTracker');
        const collection = db.collection('pageVisits');

        // Increment visit count for the page
        await collection.updateOne(
            { page },
            { $inc: { visits: 1 } },
            { upsert: true }
        );

        res.status(200).json({ message: 'Page visit tracked' });
    } catch (err) {
        console.error('Error tracking page:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// API to fetch all page visit data
app.get('/visits', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('webTracker');
        const collection = db.collection('pageVisits');

        const data = await collection.find().toArray();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching visits:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
