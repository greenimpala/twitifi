var http = require('http');
var bind = require('bind-this');
var util = require('util');
var Twit = require('twit');
var SpotifyService = require('./SpotifyService');

var TweetService = function (config) {
	this.twit = new Twit(config);
	this.idle = false;
	this.cache = { tweets: [], since_id: 0 };
	this.poll();
};

TweetService.QUERY = 'spoti.fi';
TweetService.POLL_TIMEOUT = 8000;
TweetService.MAX_CACHE = 30;

TweetService.prototype = {
	getTweetsSinceId: function (id) {
		var filtered = this.cache.tweets.filter(function (tweet) {
			return tweet.id > id;
		});

		return JSON.stringify({
			tweets: filtered,
			since_id: this.cache.since_id
		});
	},

	poll: function (sinceId) {
		this.twit.get('search/tweets', {
			q: TweetService.QUERY,
			since_id: sinceId
		}, bind(this, '_onTweetsResponse'));
	},

	resume: function () {
		if (this.idle) {
			this.idle = false;
			this.poll(this.cache.since_id);
		}
	},

	pause: function () {
		if (!this.idle) {
			this.idle = true;
		}
	},

	_onTweetsResponse: function (err, response) {
		if (err){
			this._schedulePoll();
			return util.log(err);
		}

		var tweets = response.statuses;
		var sinceId = tweets.length ? this._getGreatestId(tweets) : response.search_metadata.since_id;

		SpotifyService.addImageURLSToTweets(tweets)
		.then(bind(this, function (tweets) {
			if (this.idle) { return; }

			this._addTweetsToCache(tweets, sinceId);
			this._schedulePoll(sinceId);
		}));
	},

	_getGreatestId: function (tweets) {
		var ids = tweets.map(function (tweet) { return tweet.id; });

		return ids.reduce(function (previous, current) {
			return Math.max(previous, current);
		}, 0);
	},

	_schedulePoll: function (sinceId) {
		setTimeout(bind(this, 'poll', sinceId), TweetService.POLL_TIMEOUT);
	},

	_addTweetsToCache: function (tweets, since_id) {
		this.cache.since_id = since_id;

		tweets.forEach(bind(this, function (tweet) {
			if (this.cache.tweets.length === TweetService.MAX_CACHE) {
				this.cache.tweets.shift();
			}
			this.cache.tweets.push(tweet);
		}));
	}
};

module.exports = TweetService;
