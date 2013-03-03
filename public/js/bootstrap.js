require.config({
	paths: {
		'text': 'vendor/text',
		'domReady': 'vendor/domReady'
	}
});

require([
	'AppView',
	'domReady'
], function (AppView) {
	var app = new AppView();
	app.$el.appendTo('body');
});