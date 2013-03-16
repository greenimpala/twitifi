define([
	'text!./template/app.html',
	'RowView'
], function (template, RowView) {
	var POLL_TIMEOUT = 5000,
		MAX_ROW_WIDTH = 215;

	/**
	 * @constructor
	 */
	var App = function () {
		this._maxRows = null;
		this._rowWidth = null;
		this._sinceId = null;
		this._rows = [];

		this.initialize();
	};

	App.prototype = {
		/**
		 * @function
		 */
		initialize: function () {
			this.$el = $('body').html(template);
			this.$board = this.$el.find('.board');

			this.resize();
			this._poll();

			$(window).on('resize', _.bind(this.resize, this));
		},

		/**
		 * @function
		 * @return {$.Promise}
		 */
		_trimOldRow: function () {
			var remove, row, def = $.Deferred();

			row = this._rows.shift();
			row.$el.width(0);

			remove = function () {
				row.$el.remove();
				def.resolve();
			};

			setTimeout(remove, 1000);
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
			var animationEnd, row;

			// If the board is full we get an animation end promise from
			// trimming an older row and pass it to the new row
			if (this._isFull()) {
				animationEnd = this._trimOldRow();
			}

			row = new RowView(this._rowWidth, animationEnd);

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
			})
			.done(_.bind(this._onTweets, this))
			.fail(_.bind(this._schedulePoll, this));
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
		resize: function () {
			var width, maxRows, rowWidth;

			windowWidth = $(window).width();
			maxRows = Math.floor(windowWidth / MAX_ROW_WIDTH);
			rowWidth = Math.floor(windowWidth / maxRows);

			// Delete old rows if we are over the new limit
			while (this._rows.length > maxRows) {
				this._trimOldRow();
			}

			this._maxRows = maxRows;
			this._rowWidth = rowWidth;

			_.each(this._rows, function (row) {
				row.resize(rowWidth);
			});
		}
	};

	return App;
});