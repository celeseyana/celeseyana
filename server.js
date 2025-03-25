import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

app.get('/api/leaderboard', async (req, res) => {
    try {
        const response = await fetch('https://bestdori.com/api/eventtop/data?server=1&event=257&mid=0&latest=1');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
});

app.listen(3000, () => console.log('listening...'));
