const express = require('express');
const bodyParser = require('body-parser');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();

app.use(bodyParser.json());

// Endpoint to analyze sentiment
app.post('/', (req, res) => {
    const  comments  = req.body.data[0];
    if (!comments) {
        return res.status(400).json({ error: 'Invalid input. Expected an array of comments.' });
    }

    const results = comments.map(comment => {
        console.log('scoring comment:', comment.text);
        const analysis = sentiment.analyze(comment.text);
        //console.log('analysis:', analysis);
        return {
            score: analysis.score,
            comparative: analysis.comparative,
            ...comment,
        };
    });
    res.json(results);
});

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Sentiment Analysis Server is running on port ${PORT}`);
});
