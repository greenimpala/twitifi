var http = require('http');
var bind = require('bind-this');
var util = require('util');
var Twit = require('twit');
var strint = require('./strint');
var SpotifyService = require('./SpotifyService');

var TweetService = function (config) {
	this.spotifyService = new SpotifyService();
	this.twit = new Twit(config);
	this.idle = false;
	this.cache = { tweets: [], since_id: '0' };
	this._poll();
};

TweetService.QUERY = 'spoti.fi';
TweetService.POLL_TIMEOUT = 6000;
TweetService.MAX_CACHE = 30;

TweetService.prototype = {

	getTweetsSinceId: function (id) {
		var filtered;

		filtered = this.cache.tweets.filter(function (tweet) {
			return strint.gt(tweet.id_str, id);
		});

		return JSON.stringify({
			tweets: filtered,
			since_id: this.cache.since_id
		});
	},

	resume: function () {
		if (this.idle) {
			this.idle = false;
			this._poll(this.cache.since_id);
		}
	},

	pause: function () {
		if (!this.idle) {
			this.idle = true;
		}
	},

	_poll: function (sinceId) {
		this.twit.get('search/tweets', {
			q: TweetService.QUERY,
			since_id: sinceId
		}, bind(this, '_onTweetsResponse'));
	},

	_onTweetsResponse: function (err, response) {
		if (err){
			this._schedulePoll();
			return util.log(err);
		}

		var tweets = response.statuses;
		var sinceId = tweets.length ? this._getGreatestId(tweets) : response.search_metadata.since_id_str;
		sinceId = strint.add(sinceId, '1');

		this.spotifyService.addImageURLSToTweets(tweets).then(bind(this, function (tweets) {
			if (this.idle) { return; }

			this.cache.since_id = sinceId;
			this._schedulePoll(sinceId);
			this._addTweetsToCache(tweets);
		}));
	},

	_getGreatestId: function (tweets) {
		var ids = tweets.map(function (tweet) { return tweet.id_str; });

		return ids.reduce(function (previous, current) {
			return strint.gt(previous, current) ? previous : current;
		}, '0');
	},

	_schedulePoll: function (sinceId) {
		setTimeout(bind(this, '_poll', sinceId), TweetService.POLL_TIMEOUT);
	},

	_addTweetsToCache: function (tweets) {
		tweets.forEach(bind(this, function (tweet) {
			if (this.cache.tweets.length === TweetService.MAX_CACHE) {
				this.cache.tweets.shift();
			}
			this.cache.tweets.push(tweet);
		}));
	}
};

module.exports = TweetService;
