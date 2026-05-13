// server.js
// Setup instructions:
// 1. Run 'npm install' to install dependencies.
// 2. Create a '.env' file in the root directory and add: BRAWL_STARS_API_KEY=your_api_key_here
// 3. Run 'npm start' to start the server.
// 4. Open http://localhost:3000 in your browser.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/player/:tag', async (req, res) => {
    try {
        // 1. Get the tag from the URL parameters
        let tag = req.params.tag;

        // 2. Remove all spaces and # symbols, then convert to uppercase
        tag = tag.replace(/\s+/g, '').replace(/#/g, '').toUpperCase();
        console.log(`[DEBUG] Cleaned player tag: ${tag}`);

        const apiKey = process.env.BRAWL_STARS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key in .env file' });
        }

        // 3. Ensure the API request uses %23 before the player tag
        const url = `https://api.brawlstars.com/v1/players/%23${tag}`;

        // 4. Log the final API URL in the terminal for debugging
        console.log(`\n[DEBUG] Fetching Brawl Stars API URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        // 5. Log the Brawl Stars API response status code
        console.log(`[DEBUG] Brawl Stars API Response Status: ${response.status}`);

        // 6. Show different errors based on the status code
        if (!response.ok) {
            if (response.status === 400) {
                return res.status(400).json({ error: 'Invalid input. Please provide a valid player tag.' });
            }
            if (response.status === 403) {
                return res.status(403).json({ error: 'Invalid API key or IP address not allowed (403 Forbidden).' });
            }
            if (response.status === 404) {
                return res.status(404).json({ error: 'Player not found. Please check the tag and try again.' });
            }
            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment before searching again.' });
            }
            if (response.status >= 500) {
                return res.status(response.status).json({ error: `Brawl Stars API server error (${response.status}).` });
            }
            return res.status(response.status).json({ error: `API Error: ${response.statusText}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch data from Brawl Stars API.' });
    }
});

app.get('/api/debug-ip', async (req, res) => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            return res.status(response.status).json({ error: `Failed to fetch IP: ${response.statusText}` });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching public IP:', error);
        res.status(500).json({ error: 'Internal server error while fetching public IP address.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
