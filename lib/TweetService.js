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
				this.onTweetsResponse(JSON.parse(buffer));
			}));
		}));

		return this;
	},

	onTweetsResponse: function (response) {
		var tweets = response.results;

		SpotifyService.addImageURLSToTweets(tweets)
		.then(bind(this, function (tweets) {
			// We may have gone idle
			if (!this.idle) {
				this.cache.since_id = response.since_id;
				this.addTweetsToCache(tweets, response.since_id);
				setTimeout(bind(this, 'poll', response.refresh_url), this.POLL_TIMEOUT);
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
			this.cache.tweets.forEach(function (tweet) {
				tweet.since_id = 0;
			});
		}
	}
}.poll();

module.exports = TweetService;
