$(function () {
	var POLL_TIMEOUT = 5000;
	var MAX_ROWS = 5;
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
			var tile = new Tile();
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

	/**
	 * @constructor
	 */
	var Tile = function () {
		this.$el = $('<div>').addClass('tile');
		this.$el.append($('<img>'));
	};

	/**
	 * @constructor
	 */
	var App = function () {
		this._rows = [];
		this._sinceId = -1;
		this.$el = $('<div>').addClass('board');

		$(window).on('resize', _.bind(this._resizeRows, this));
		this._poll();
	};

	App.prototype = {
		/**
		 * @function
		 * @return {$.Promise}
		 */
		_trimOldRow: function () {
			var def = $.Deferred();

			if (this._rows.length === MAX_ROWS && _.last(this._rows).isFull()) {
				var row = this._rows.shift();
				row.$el.width(0);

				setTimeout(function () {
					row.$el.remove();
					def.resolve();
				}, 1000);
			} else {
				// No row to trim, return a resolved promise
				def.resolve();
			}
			return def.promise();
		},

		/**
		 * @function
		 * @return {Row}
		 */
		_addRow: function () {
			// Get a 'ready' promise from trimming an old row, the new
			// row is ready when the animation promise resolves
			var ready = this._trimOldRow();
			var row = new Row(ready);

			this.$el.append(row.$el);
			this._rows.push(row);

			return row;
		},

		/**
		 * @function
		 */
		_poll: function () {
			$.get('/tweets', {
				'since_id': this._sinceId
			}, _.bind(this._onTweets, this));
		},

		/**
		 * @function
		 * @param {{
			since_id: string,
			tweets: Object
		   }} response
		 */
		_onTweets: function (response) {
			this._renderTweets(response.tweets);
			this._sinceId = response.since_id;
			this._schedulePoll();
		},

		/**
		 * @function
		 */
		_schedulePoll: function () {
			setTimeout(_.bind(this._poll, this), POLL_TIMEOUT);
		},

		/**
		 * @function
		 * @param {Array} tweets
		 */
		_renderTweets: function (tweets) {
			var row = _.last(this._rows) || this._addRow();

			_.each(tweets, function (tweet) {
				if (row.isFull()) {
					row = this._addRow();
				}
				row.addTile(tweet);
			}, this);
		},

		/**
		 * @function
		 */
		_resizeRows: function () {
			_.each(this._rows, function (row) {
				row.resize();
			});
		}
	};

	var app = new App();
	app.$el.appendTo('body');
});