var connect = require('connect');
var url = require('url');
var bind = require('bind-this');

var Server = function (tweetService) {
	this._tweetService = tweetService;
	this._app = connect();
	this._lastRequest = +new Date();
	this.initialise();
};

Server.IDLE_TIMEOUT = 1000 * 30;

Server.prototype.initialise = function () {
	this._app.use(connect.static('public'));
	this._app.use(bind(this, '_onRequest'));
	setInterval(bind(this, '_pauseTweetServiceIfIdle'), Server.IDLE_TIMEOUT);
};

Server.prototype._onRequest = function (req, res) {
	if (/^\/tweets/.test(req.url) && req.method === 'GET') {
		this._getTweets(req, res);
	} else {
		res.statusCode = 404;
		res.end();
	}
};

Server.prototype._getTweets = function (req, res) {
	var sinceId, query;

	if (this._tweetService.idle) {
		this._tweetService.resume();
	}

	this._lastRequest = +new Date();

	try {
		query = url.parse(req.url).query;
		sinceId = query.split('=')[1];
	} catch (e) {}

	if (!sinceId) {
		sinceId = '-1';
	}

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(this._tweetService.getTweetsSinceId(sinceId));
};

Server.prototype._pauseTweetServiceIfIdle = function () {
	var timeSinceLastRequest = +new Date() - this._lastRequest;

	if (timeSinceLastRequest > Server.IDLE_TIMEOUT && !this._tweetService.idle) {
		this._tweetService.pause();
	}
};

Server.prototype.listen = function () {
	this._app.listen.apply(this._app, arguments);
};

module.exports = Server;
