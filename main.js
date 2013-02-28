var connect = require('connect');
var url = require('url');
var TweetService = require('./lib/TweetService');

connect()
	.use(connect.static('public'))
	.use(function (req, res) {
		if (/^\/tweets/.test(req.url) && req.method === 'GET') {
			var query = url.parse(req.url).query;
			var sinceId;

			if (query) {
				sinceId = query.split('=')[1];
			}
			sinceId = sinceId || 0;

			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(TweetService.getTweetsSinceId(sinceId));
		} else {
			res.statusCode = 404;
			res.end();
		}
	})
	.listen(8080);