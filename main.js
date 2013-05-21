var fs = require('fs');
var Server = require('./lib/Server');
var TweetService = require('./lib/TweetService');
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

require('http').globalAgent.maxSockets = 100000;
var app = new Server(new TweetService(config));
app.listen(3000, '127.0.0.1');