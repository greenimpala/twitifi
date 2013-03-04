var http = require('http');
var bind = require('bind-this');
var Q = require('q');
var cheerio = require('cheerio');

var SpotifyService = {
	SPOTIFY_URL_MATCHER: /http:\/\/t.co\/\w+/,

	addImageURLSToTweets: function (tweets) {
		var promises = [];

		tweets.forEach(bind(this, function (tweet) {
			promises.push(this._getAttributesForTweet(tweet));
		}));

		return Q.allResolved(promises).then(function (promises) {
			var tweets = [];

			// Gather the tweets from the promises
			// that were not rejected
			promises.forEach(function (promise) {
				if (promise.isFulfilled()) {
					tweets.push(promise.valueOf());
				}
			});

			return tweets;
		});
	},

	_getSpotifyURL: function (tweetText) {
		return tweetText.match(this.SPOTIFY_URL_MATCHER)[0];
	},

	_getAttributesForTweet: function (tweet) {
		var url = this._getSpotifyURL(tweet.text);

		return this._getSpotifyAttributes(url).then(function (attributes) {
			tweet.spotify = attributes;

			return tweet;
		});
	},

	_getSpotifyAttributes: function (url, defer) {
		defer = defer || Q.defer();

		http.get(url, bind(this, function (defer, url, res) {
			var buffer = '', redirect;

			if (res.statusCode === 301) {
				redirect = res.headers.location;

				if (/^http:\/\//.test(redirect)) {
					// Follow redirect
					this._getSpotifyAttributes(res.headers.location, defer);
				} else {
					// Reject if URL is non-standard
					return defer.reject();
				}
			} else {
				res.on('data', function (chunk) {
					buffer += chunk;
				});

				res.on('end', function () {
					var attributes, $ = cheerio.load(buffer);

					// Parse the HTML page for
					// required attributes
					attributes = {
						image: $('#big-cover').attr('src'),
						title: $('meta[property="og:title"]').attr('content').substring(0, 30),
						url: $('meta[property="og:url"]').attr('content'),
						description: $('meta[property="og:description"]').attr('content'),
						audio: $('meta[property="og:audio"]').attr('content')
					};

					// Validate attributes
					if (attributes.image) {
						defer.resolve(attributes);
					} else {
						defer.reject();
					}
				});
			}
		}, defer, url));

		return defer.promise;
	}
};

module.exports = SpotifyService;