import express from 'express';
import shortid from 'shortid';
import qr from 'qr-image';
import client from './redisClient.js';

const router = express.Router();

// Shorten URL
router.post('/shorten', async (req, res) => {
    const { url, customId } = req.body;
    const id = customId || shortid.generate();
    await client.hSet('urls', id, url);
    res.json({ id, url });
});

// Redirect URL
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const url = await client.hGet('urls', id);
    if (url) {
        await client.hIncrBy('analytics', id, 1);
        res.redirect(url);
    } else {
        res.status(404).send('URL not found');
    }
});

// Generate QR Code
router.get('/qr/:id', async (req, res) => {
    const id = req.params.id;
    const url = await client.hGet('urls', id);
    if (url) {
        const qrSvg = qr.imageSync(url, { type: 'svg' });
        res.type('svg').send(qrSvg);
    } else {
        res.status(404).send('URL not found');
    }
});

// Link Analytics
router.get('/analytics/:id', async (req, res) => {
    const id = req.params.id;
    const count = await client.hGet('analytics', id);
    res.json({ id, count });
});

// Link History
router.get('/history', async (req, res) => {
    try {
        const urls = await client.hGetAll('urls');
        const analytics = await client.hGetAll('analytics');
        const history = Object.entries(urls).map(([id, url]) => ({
            id,
            url,
            count: parseInt(analytics[id], 10) || 0 // Ensure count is an integer
        }));
        res.json(history);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).send('Server error');
    }
});

export default router;
