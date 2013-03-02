var http = require('http');
var bind = require('bind-this');
var Q = require('q');

var SpotifyService = {
	SPOTIFY_URL_MATCHER: /http:\/\/t.co\/\w+/,

	addImageURLSToTweets: function (tweets) {
		var promises = [];

		tweets.forEach(bind(this, function (tweet) {
			promises.push(this._addImageURLToTweet(tweet));
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

	_addImageURLToTweet: function (tweet) {
		var url = this._getSpotifyURL(tweet.text);

		return this._getImageURL(url).then(function (imageURL) {
			tweet.spotify = {
				image: imageURL,
				url: url
			};

			return tweet;
		});
	},

	_getImageURL: function (url, defer) {
		defer = defer || Q.defer();

		http.get(url, bind(this, function (defer, url, res) {
			var buffer = '', redirect;

			if (res.statusCode === 301) {
				redirect = res.headers.location;

				if (/^http:\/\//.test(redirect)) {
					// Follow redirect
					this._getImageURL(res.headers.location, defer);
				} else {
					// Reject if URL is non-standard
					return defer.reject();
				}
			} else {
				res.on('data', function (chunk) {
					buffer += chunk;
				});

				res.on('end', function () {
					// Get the URL using awful string slicing
					// Could not get RegEx to work here
					buffer = buffer.substr(buffer.indexOf("\"album-cover-art\">"), 200);
					buffer = buffer.substring(buffer.indexOf("http://"), buffer.indexOf("border="));
					buffer = buffer.substring(0, buffer.indexOf("\""));

					if (buffer) {
						defer.resolve(buffer);
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