var fs = require('fs');
var Server = require('./lib/Server');
var TweetService = require('./lib/TweetService');

var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var app = new Server(new TweetService(config));

app.listen(3000, '127.0.0.1');