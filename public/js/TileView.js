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
		template: _.template(template),

		/**
		 * @function
		 * @return {$.Promise}
		 */
		render: function () {
			var self = this;

			this.$el = $(this.template(this.data));
			this.$image = this.$el.find('img');

			this.$image.attr('src', this.data.spotify.image).load(function () {
				$(this).fadeIn(500);
				self._loaded.resolve();
			});

			return this._loaded;
		}
	};

	return Tile;
});