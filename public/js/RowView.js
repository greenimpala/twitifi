define([
	'TileView'
], function (TileView) {
	var MAX_TILES_PER_ROW = 4;

	/**
	 * @constructor
	 * @param {$.Promise} ready
	 */
	var Row = function (ready) {
		this.ready = ready;
		this.tiles = [];
		this.$el = $('<div>').addClass('row');
	};

	Row.prototype = {
		/**
		 * @function
		 * @param {Object} tweet
		 */
		addTile: function (tweet) {
			var tile = new TileView();
			this.tiles.push(tile);
			this.ready.then(_.bind(this._renderTile, this, tile, tweet));
		},

		/**
		 * @function
		 * @return {boolean}
		 */
		isFull: function () {
			return this.tiles.length === MAX_TILES_PER_ROW;
		},

		/**
		 * @function
		 */
		resize: function () {
			_.each(this.tiles, function (tile) {
				tile.$el.height(tile.$el.width());
			});
		},

		/**
		 * @function
		 */
		_renderTile: function (tile, tweet) {
			var image = tile.$el.find('img');
			var self = this;

			image.attr('src', tweet.spotify.image).load(function () {
				$(this).fadeIn(500);
				self.$el.append(tile.$el);
				self.resize();
			});
		}
	};

	return Row;
});