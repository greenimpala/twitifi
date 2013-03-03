define([
	'text!./template/tile.html'
], function (template) {
	/**
	 * @constructor
	 */
	var Tile = function () {
		this.$el = $(template);
	};

	return Tile;
});