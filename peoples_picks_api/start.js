const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;
const host = '0.0.0.0';

app.use(express.json());

let data = [];
let refreshInterval = 5;
let intervalId = setInterval(loadData, refreshInterval * 1000);

app.get('/aggregate', async (req, res) => {
    try {
        const filterKeyword = req.query.filter;

        await loadData();

        let filteredData = data;

        if (filterKeyword) {
            filteredData = data.filter((item) => {
                const hostMatch = getHost(item.url).toLowerCase().includes(filterKeyword.toLowerCase());
                return hostMatch;
            });
        }

        const urlVotesMap = new Map();
        let totalUpvotes = 0;
        let totalDownvotes = 0;

        filteredData.forEach((item) => {
            const voteValue = item.upvote ? 1 : -1;

            if (!urlVotesMap.has(item.url)) {
                urlVotesMap.set(item.url, {
                    url: item.url,
                    upvotes: 0,
                    downvotes: 0,
                    totalVotes: 0,
                    trend: null,
                    title: item.title,
                    host: getHost(item.url),
                });
            }

            const currentData = urlVotesMap.get(item.url);
            currentData.upvotes += item.upvote ? 1 : 0;
            currentData.downvotes += item.upvote ? 0 : 1;
            currentData.totalVotes += voteValue;
            urlVotesMap.set(item.url, currentData);

            totalUpvotes += item.upvote ? 1 : 0;
            totalDownvotes += item.upvote ? 0 : 1;
        });

        urlVotesMap.forEach((value, key) => {
            value.trend = value.upvotes + value.downvotes;
            urlVotesMap.set(key, value);
        });

        const aggregatedData = Array.from(urlVotesMap.values());

        res.json(aggregatedData);
    } catch (error) {
        console.error('Error reading data.json:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, host, () => {
    console.log(`Server running on http://localhost:${port}`);
});

function getHost(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/i);
    return match && match[1];
}

async function loadData() {
    try {
        const newData = await readDataFile();
        data = [...data, ...newData];
    } catch (error) {
        console.error('Error loading data from data.json:', error);
    }
}

async function readDataFile() {
    try {
        const content = await fs.readFile(path.join(__dirname, 'data.json'), 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading data.json:', error);
        return [];
    }
}
