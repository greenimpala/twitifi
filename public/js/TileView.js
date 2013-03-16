define([
	'text!./template/tile.html'
], function (template) {
	/**
	 * @constructor
	 */
	var Tile = function (tweet) {
		this.data = tweet;
		this._loaded = $.Deferred();
		this.$el = $(template);
	};

	Tile.prototype = {
		/**
		 * @field
		 * @type {function}
		 */
		template: _.template(template),

		/**
		 * @function
		 * @return {$.Promise}
		 */
		render: function () {
			var self = this;

			this.data.retweet_link = this._generateRetweetLink();
			this.$el = $(this.template(this.data));
			this.$image = this.$el.find('img');

			this.$image.attr('src', this.data.spotify.image).load(function () {
				$(this).fadeIn(500);
				self._loaded.resolve();
			});

			return this._loaded;
		},

		/**
		 * @function
		 * @return {string}
		 */
		_generateRetweetLink: function () {
			var link = [
				'https://twitter.com/intent/tweet?text=',
				this.data.spotify.url,
				' - \'' + this.data.spotify.title + '\'',
				' via Twitifi - ',
				'http://twitifi.bradshaw.io'
			].join('');

			return encodeURI(link);
		}
	};

	return Tile;
});