const Sentiment = require('sentiment');
const sentiment = new Sentiment();

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

var options = {
    extras: {
      '🔥': 3,
      '💪🏻': 3,
      'moon': 3
    }
  };


comment = "🔥💪🏻 happy"
split = emojiStringToArray(comment);
const trimmedStrings = split.map(comment => comment.trim());
comment = trimmedStrings.join(' ');

console.log(split)

const analysis = sentiment.analyze(comment, options);
console.log(analysis)