var http = require('http');
var bind = require('bind-this');
var SpotifyService = require('./SpotifyService');

var TweetService = {
	QUERY: 'spoti.fi',

	POLL_TIMEOUT: 8000,

	MAX_CACHE: 30,

	idle: false,

	cache: {
		tweets: [],
		since_id: 0
	},

	getTweetsSinceId: function (id) {
		var filtered = this.cache.tweets.filter(function (tweet) {
			return tweet.since_id > id;
		});

		return JSON.stringify({
			tweets: filtered,
			since_id: this.cache.since_id
		});
	},

	poll: function (refreshURL) {
		var url;

		url = 'http://search.twitter.com/search.json';
		url += refreshURL ? refreshURL : '?q=' + this.QUERY;

		http.get(url, bind(this, function (res) {
			var buffer = '';
			res.setEncoding('utf8');

			if (res.statusCode !== 200) {
				this.poll.apply(this, arguments);
			}

			res.on('data', function (chunk) {
				buffer += chunk;
			});

			res.on('end', bind(this, function () {
				this.onTweetsResponse(buffer);
			}));
		}));

		return this;
	},

	onTweetsResponse: function (buffer) {
		var response, tweets;

		response = JSON.parse(buffer);
		tweets = response.results;

		// Delegate to Spotify service to get image data
		SpotifyService.addImageURLSToTweets(tweets)
		.then(bind(this, function success (tweets) {
			this.cache.since_id = response.since_id;
			this.addTweetsToCache(tweets, response.since_id);

			if (!this.idle) {
				this._timeout = setTimeout(bind(this, 'poll', response.refresh_url), this.POLL_TIMEOUT);
			}
		}));
	},

	addTweetsToCache: function (tweets, since_id) {
		tweets.forEach(bind(this, function (tweet) {
			if (this.cache.tweets.length === this.MAX_CACHE) {
				this.cache.tweets.shift();
			}
			tweet.since_id = since_id;
			this.cache.tweets.push(tweet);
		}));
	},

	resume: function () {
		if (this.idle) {
			this.idle = false;
			this.poll();
		}
	},

	pause: function () {
		if (!this.idle) {
			this.idle = true;
			this.cache.since_id = 0;
			clearTimeout(this._timeout);
		}
	}
}.poll();

module.exports = TweetService;
