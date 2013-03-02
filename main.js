var connect = require('connect');
var url = require('url');
var TweetService = require('./lib/TweetService');

var app = connect();
app.use(connect.static('public'));
app.use(function (req, res) {
	if (/^\/tweets/.test(req.url) && req.method === 'GET') {
		getTweets(req, res);
	} else {
		res.statusCode = 404;
		res.end();
	}
});

function getTweets (req, res) {
	var sinceId, query;

	try {
		query = url.parse(req.url).query;
		sinceId = parseInt(query.split('=')[1], 10);
	} catch (e) {}

	if (isNaN(sinceId)) {
		sinceId = -1;
	}

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(TweetService.getTweetsSinceId(sinceId));
}

app.listen(8080);