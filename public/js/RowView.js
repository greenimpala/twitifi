define([
	'TileView'
], function (TileView) {
	var MAX_TILES_PER_ROW = 4;

	/**
	 * @constructor
	 * @param {$.Promise=} ready
	 * @param {string} width
	 */
	var Row = function (ready, width) {
		this.ready = ready || $.Deferred().resolve();
		this.tiles = [];

		this.$el = $('<div>').addClass('row').width(width);
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
		resize: function (width) {
			width = width || this.$el.width();
			this.$el.width(width);

			_.each(this.tiles, function (tile) {
				var elems = tile.$el.height(width).find('.front, .back');
				elems.height(width);
				elems.width(width);
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