var fs = require('fs');
var http = require('http');
var Server = require('./lib/Server');
var TweetService = require('./lib/TweetService');
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

http.globalAgent.maxSockets = 100000;

var tweetService = new TweetService(config);
var app = new Server(tweetService);

app.listen(3000, '127.0.0.1');
console.info('twitifi server started on port 3000.');