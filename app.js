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
	}

	Row.prototype.isFull = function () {
		return this.tiles.length === this.MAX_TILES;
	}

	Row.prototype.resize = function () {
		$.each(this.tiles, function () {
			this.$el.height(this.$el.width());
		});
	}

	var Tile = function () {
		this.$el = $(document.createElement("div")).addClass("tile");
		this.$el.append(document.createElement("img"));
	};

	var App = {
		POLL_DURATION: 1000,

		MAX_ROWS: 5,

		currentRow: null,

		rows: 0,

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
			setInterval(function () { self._fetchTracks(); }, this.POLL_DURATION);
		},

		_fetchTracks: function () {
			// TODO: Server fetch
			var albums = [
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Beatles-Sgt-Peppers-Lonel-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Herb-Alpert-Whipped-Cream-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Pink-Floyd-Dark-Side-of-t-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Joni-Mitchell-Hijera-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/The-Doors-Strange-Days-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/The-Police-Ssynchronicity-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Beatles-Abbey-Road-album-500x500.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Nirvana-Nevermind-album-.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/The-Sex-Pistols-Never-Min.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/The-Clash-London-Calling-.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Pet-Shop-Boys-%E2%80%93-Yes-album-.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Rolling-Stones-%E2%80%93-Forty-Lick.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/The-Starting-Line-Directi.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Beatles-One-album-cover.jpg",
				"http://www.alexandruvita.com/blog/wp-content/uploads/2010/05/Paramore-Riot-album-cove.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043620834-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043613678-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041753637-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041752324-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043614288-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041750137-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043614756-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043612975-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041745778-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041746637-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041749527-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043618444-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043619491-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041747981-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041755090-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043615194-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041752949-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041754324-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043622037-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041757965-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043612100-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041800090-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041755746-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043621194-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527044518649-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043623772-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043619053-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041800808-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041747340-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041757277-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041751496-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/25-most-iconic-album-covers-of-all-time-20110527043622444-000.jpg",
				"http://musicmedia.ign.com/music/image/article/117/1171117/top-25-most-iconic-album-covers-20110718041758636-000.jpg"
			]
			var tracks = [{ image: albums[Math.floor(Math.random() * albums.length)] }];
			this._renderTracks(tracks);
		},

		_renderTracks: function (tracks) {
			if (!this.currentRow.isFull()) {
				this.currentRow.addTrack(tracks[0]);
				this.trimRows();
			} else {
				this.createRow();
				this._renderTracks(tracks);
			}
		}
	}.initialise();
});