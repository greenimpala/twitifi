$(function () {
	var POLL_TIMEOUT = 5000;
	var MAX_ROWS = 5;
	var MAX_TILES = 4;

	/**
	 * @constructor
	 * @param {jQuery.Promise} ready
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
		 */
		_renderTile: function (tile, tweet) {
			var image = tile.$el.find('img');
			var self = this;

			image.attr('src', tweet.spotify.image).load(function () {
				$(this).fadeIn(500);
				self.$el.append(tile.$el);
				self.resize();
			});
		},

		/**
		 * @function
		 * @return {boolean}
		 */
		isFull: function () {
			return this.tiles.length === MAX_TILES;
		},

		/**
		 * @function
		 */
		resize: function () {
			_.each(this.tiles, function (tile) {
				tile.$el.height(tile.$el.width());
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
	var App = function ($container) {
		this.rows = [];
		this.sinceId = -1;
		this.$el = $('<div>').addClass('board');

		$(window).on('resize', _.bind(this._resizeRows, this));
		this.poll();
		$container.append(this.$el);
	};

	App.prototype = {
		/**
		 * @function
		 * @return {jQuery.Promise}
		 */
		trimOldRow: function () {
			var def = $.Deferred();

			if (this.rows.length === MAX_ROWS && _.last(this.rows).isFull()) {
				var row = this.rows.shift();
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
		addRow: function () {
			// Get a 'ready' promise from trimming an old row, the new
			// row is ready when the animation promise resolves
			var ready = this.trimOldRow();
			var row = new Row(ready);

			this.$el.append(row.$el);
			this.rows.push(row);

			return row;
		},

		/**
		 * @function
		 */
		poll: function () {
			$.get('/tweets', {
				'since_id': this.sinceId
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
			this.sinceId = response.since_id;
			this._schedulePoll();
		},

		/**
		 * @function
		 */
		_schedulePoll: function () {
			setTimeout(_.bind(this.poll, this), POLL_TIMEOUT);
		},

		/**
		 * @function
		 * @param {Array.<Object>} tweets
		 */
		_renderTweets: function (tweets) {
			var row = _.last(this.rows) || this.addRow();

			_.each(tweets, function (tweet) {
				if (row.isFull()) {
					row = this.addRow();
				}
				row.addTile(tweet);
			}, this);
		},

		/**
		 * @function
		 */
		_resizeRows: function () {
			_.each(this.rows, function (row) {
				row.resize();
			});
		}
	};

	var app = new App($('body'));
});