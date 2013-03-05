define([
	'text!./template/app.html',
	'RowView'
], function (template, RowView) {
	var POLL_TIMEOUT = 5000,
		MAX_ROWS = 5,
		ROW_WIDTH = 230;

	/**
	 * @constructor
	 */
	var App = function () {
		this._maxRows = null;
		this._rows = [];
		this._sinceId = -1;

		this.initialize();
	};

	App.prototype = {
		/**
		 * @function
		 */
		initialize: function () {
			this.$el = $('body').html(template);
			this.$board = this.$el.find('.board');

			this._resize();
			this._poll();

			$(window).on('resize', _.bind(this._resize, this));
		},

		/**
		 * @function
		 * @return {$.Promise}
		 */
		_trimOldRow: function () {
			var def = $.Deferred();

			var row = this._rows.shift();
			row.$el.width(0);

			setTimeout(function () {
				row.$el.remove();
				def.resolve();
			}, 1000);

			return def.promise();
		},

		/**
		 * @function
		 * @return {boolean}
		 */
		_isFull: function () {
			return this._rows.length === this._maxRows;
		},

		/**
		 * @function
		 * @return {Row}
		 */
		_addRow: function () {
			var ready, row;

			// If the board is full we get a 'ready' promise from
			// trimming an older row, the new row is ready when the
			// animation promise resolves
			if (this._isFull()) {
				ready = this._trimOldRow();
			}

			row = new RowView(ready);

			this.$board.append(row.$el);
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
			var tweets = response.tweets;
			tweets = tweets.splice(0, this._maxRows * 4); // Trim to max board size

			this._renderTweets(tweets);
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
		_resize: function () {
			var width, newMaxRow;

			width = $(window).width();
			newMaxRow = Math.floor(width / ROW_WIDTH);

			if (newMaxRow < this._rows.length) {
				this._trimOldRow();
			}

			this._maxRows = Math.floor(width / ROW_WIDTH);
			_.each(this._rows, function (row) {
				row.resize();
			});
		}
	};

	return App;
});