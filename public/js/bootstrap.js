require([
	'AppView',
	'domReady'
], function (AppView) {
	var app = new AppView();
	app.$el.appendTo('body');
});