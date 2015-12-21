var fs = require('fs');
var http = require('http');
var Server = require('./lib/Server');
var TweetService = require('./lib/TweetService');
var PORT = process.env.PORT || 3000;

http.globalAgent.maxSockets = 100000;

var tweetService = new TweetService({
    "consumer_key": process.env.consumer_key,
    "consumer_secret": process.env.consumer_secret,
    "access_token": process.env.access_token,
    "access_token_secret": process.env.access_token_secret
});
var app = new Server(tweetService);

app.listen(PORT);
console.info('twitifi server started on port ' + PORT + '.');
