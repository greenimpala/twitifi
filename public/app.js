$(function () {
	var Row = function () {
		this.MAX_TILES = 4;
		this.tiles = [];
		this.$el = $(document.createElement("div")).addClass("row");
	};

	Row.prototype.addTrack = function (track) {
		var self = this;
		var tile = new Tile();
		var image = tile.$el.find("img");

		image.attr("src", track.image).load(function () {
			$(this).fadeIn(500);
			self.$el.append(tile.$el);
			self.resize();
		});

		this.tiles.push(tile);
	};

	Row.prototype.isFull = function () {
		return this.tiles.length === this.MAX_TILES;
	};

	Row.prototype.resize = function () {
		$.each(this.tiles, function () {
			this.$el.height(this.$el.width());
		});
	};

	var Tile = function () {
		this.$el = $(document.createElement("div")).addClass("tile");
		this.$el.append(document.createElement("img"));
	};

	var App = {
		POLL_DURATION: 5000,

		MAX_ROWS: 5,

		currentRow: null,

		rows: 0,

		sinceId: 0,

		$el: $(".board"),

		initialise: function () {
			this.createRow();
			this.poll();
			return this;
		},

		trimRows: function () {
			if (this.rows === this.MAX_ROWS && this.currentRow.isFull()) {
				var row = this.$el.find(".row:eq(0)");
				row.width(0);
				this.rows--;

				setTimeout(function () {
					row.remove();
				}, 1000);
			}
		},

		createRow: function () {
			this.currentRow = new Row();
			this.$el.append(this.currentRow.$el);
			this.rows++;
		},

		poll: function () {
			var self = this;
			$.getJSON('/tweets?since_id=' + this.sinceId, function (response) {
				self._renderTracks(response.tweets);
				self.sinceId = response.since_id;
				setTimeout(function () { self.poll(); }, self.POLL_DURATION);
			});
		},

		_renderTracks: function (tracks) {
			for (var i = 0; i < tracks.length; i++) {
				if (!this.currentRow.isFull()) {
					this.currentRow.addTrack(tracks[i]);
					this.trimRows();
				} else {
					this.createRow();
					this.currentRow.addTrack(tracks[i]);
					this.trimRows();
				}
			}
		}
	}.initialise();
});