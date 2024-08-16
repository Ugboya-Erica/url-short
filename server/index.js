import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import client from './redisClient.js';

dotenv.config();

const app = express();
const port = 3000

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', router);

// Handle shortened URL redirection
app.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const url = await client.hGet('urls', id);
        if (url) {
            await client.hIncrBy('analytics', id, 1);
            res.redirect(url);
        } else {
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on localhost cmd ${port}`);
});
