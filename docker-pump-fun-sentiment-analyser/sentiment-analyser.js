const express = require('express');
const bodyParser = require('body-parser');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();

var options = {
extras: {
    '🔥': 2,
    '💪🏻': 2,
    'moon': 2
}
};

var emojiStringToArray = function (str) {
    split = str.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
    arr = [];
    for (var i=0; i<split.length; i++) {
        char = split[i]
        if (char !== "") {
        arr.push(char);
        }
    }
    return arr;
};

app.use(bodyParser.json());

// Endpoint to analyze sentiment
app.post('/', (req, res) => {
    const  comments  = req.body.data[0];
    if (!comments) {
        return res.status(400).json({ error: 'Invalid input. Expected an array of comments.' });
    }

    const results = comments.map(comment => {
        split = emojiStringToArray(comment.text);
        const trimmedStrings = split.map(text => text.trim());
        commentEmogiSplit = trimmedStrings.join(' ');
        const analysis = sentiment.analyze(commentEmogiSplit, options);
        console.log('score:' + analysis.score + " comp: "+analysis.comparative+" ", commentEmogiSplit);
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
