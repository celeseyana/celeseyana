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

app.get('/api/intervaldata', async (req, res) => {
    try {
        const intervalResponse = await fetch('https://bestdori.com/api/eventtop/data?server=1&event=257&mode=1&interval=3600000');
        const intervalData = await intervalResponse.json();
        res.json(intervalData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data intervals' });
    }
});

app.get('/api/user-icon/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        
        // Gets player profile
        const profileResponse = await fetch(`https://bestdori.com/api/player/en/${uid}?mode=2`);
        const profileData = await profileResponse.json();
        const iconStatus = profileData.data.profile.userProfileSituation.illust;
        
        // Gets card info (using first sid from leaderboard)
        const leaderboardResponse = await fetch('https://bestdori.com/api/eventtop/data?server=1&event=257&mid=0&latest=1');
        const leaderboardData = await leaderboardResponse.json();
        const user = leaderboardData.users.find(u => u.uid === parseInt(uid));

        const sid = user?.sid;

        if (!sid) throw new Error('SID not found');
        
        const cardResponse = await fetch(`https://bestdori.com/api/cards/${sid}.json`);
        const cardData = await cardResponse.json();
        const iconResourceSetName = cardData.resourceSetName;


        const calcCardResourceId = Math.floor(sid / 50);
        const formattedCardResourceId = String(calcCardResourceId).padStart(5, '0');
        
        // Construct final URL
        const iconUrl = `https://bestdori.com/assets/en/thumb/chara/card${formattedCardResourceId}_rip/${iconResourceSetName}_${iconStatus}.png`;
        
        res.json({ iconUrl });
    } catch (error) {
        console.error('Error fetching icon:', error);
        res.status(500).json({ error: 'Failed to fetch user icon' });
    }
});

app.listen(3000, () => console.log('listening...'));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

module.exports = app;