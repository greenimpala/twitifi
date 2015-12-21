var http = require('http');
var https = require('https');
var bind = require('bind-this');
var Q = require('q');
var cheerio = require('cheerio');

var SpotifyService = function () {};

SpotifyService.SPOTIFY_URL_MATCHER = /http(s)?:\/\/t.co\/\w+/;

SpotifyService.prototype = {

	addImageURLSToTweets: function (tweets) {
		var promises = [];

		tweets.forEach(bind(this, function (tweet) {
			promises.push(this._getAttributesForTweet(tweet));
		}));

		return Q.allSettled(promises).then(function (promises) {
			var tweets = [];

			// Gather the tweets from the promises
			// that were not rejected
			promises.forEach(function (promise) {
				if (promise.state === 'fulfilled' && promise.value) {
					tweets.push(promise.value);
				}
			});

			return tweets;
		});
	},

	_getSpotifyURL: function (tweetText) {
		return tweetText.match(SpotifyService.SPOTIFY_URL_MATCHER)[0];
	},

	_getAttributesForTweet: function (tweet) {
		var url;

		try {
			url = this._getSpotifyURL(tweet.text);
		} catch (e) {
			return Q.defer().reject();
		}

		return this._getSpotifyAttributes(url).then(function (attributes) {
			tweet.spotify = attributes;

			return tweet;
		});
	},

	_getSpotifyAttributes: function (url, defer) {
		defer = defer || Q.defer();
        var httpLib = url.match(/^https/) ? https : http;

		httpLib.get(url, bind(this, function (defer, url, res) {
			var buffer = '', redirect;

			if (res.statusCode === 301) {
				redirect = res.headers.location;

				if (/^http(s)?:\/\//.test(redirect)) {
					// Follow redirect
					this._getSpotifyAttributes(res.headers.location, defer);
				} else {
					// Reject if URL is non-standard
					defer.reject();
				}
			} else {
				res.on('data', function (chunk) {
					buffer += chunk;
				});

				res.on('end', bind(this, function () {
					this._parseAndResolve(buffer, defer);
				}));
			}
		}, defer, url)).on('error', function () {
			defer.reject();
		});

		return defer.promise;
	},

	_parseAndResolve: function (html, defer) {
		var attributes, $ = cheerio.load(html);

		// Parse the HTML page for
		// required attributes
		attributes = {
			image: $('meta[property="og:image"]').attr('content'),
			title: $('meta[property="og:title"]').attr('content'),
			url: $('meta[property="og:url"]').attr('content'),
			description: $('meta[property="og:description"]').attr('content'),
			audio: $('meta[property="og:audio"]').attr('content')
		};

		if (this._validate(attributes)) {
			defer.resolve(attributes);
		} else {
			defer.reject();
		}
	},

	_validate: function (attributes) {
		return attributes.image &&
			!/starred\.png$/.test(attributes.image) && // Ignore 'starred' collections
			!/artists\.png$/.test(attributes.image); // Ignore generic artist image
	}
};

module.exports = SpotifyService;
