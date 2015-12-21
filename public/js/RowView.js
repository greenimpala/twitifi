define([
	'TileView',
	'util'
], function (TileView, util) {
	var rowTiles = parseInt(util.getQueryParameter("rowTiles"), 10) || 4;

	/**
	 * @constructor
	 * @param {string} width
	 * @param {$.Promise=} ready
	 */
	var Row = function (width, ready) {
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
			return this.tiles.length === rowTiles;
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
			tile.render().then(_.bind(function () {
				this.$el.append(tile.$el);
				this.resize();
			}, this));
		}
	};

	return Row;
});
