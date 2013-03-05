define([
	'TileView'
], function (TileView) {
	var MAX_TILES_PER_ROW = 4;

	/**
	 * @constructor
	 * @param {$.Promise=} ready
	 */
	var Row = function (ready) {
		this.ready = ready || $.Deferred().resolve();
		this.tiles = [];
		this.$el = $('<div>').addClass('row');
	};

	Row.prototype = {
		/**
		 * @function
		 * @param {Object} tweet
		 */
		addTile: function (tweet) {
			var tile = new TileView(tweet);
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
				var size = tile.$el.width();
				tile.$el.height(size)
					.find('.front, .back')
					.height(size)
					.width(size); // Remove to create 'scrunch' effecet when removing
			});
		},

		/**
		 * @function
		 */
		_renderTile: function (tile) {
			var self = this;

			tile.render().then(function () {
				self.$el.append(tile.$el);
				self.resize();
			});
		}
	};

	return Row;
});