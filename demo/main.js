'use strict';

requirejs.config({
	baseUrl: '..'
});

requirejs(['nuthead'], nuthead => {
	const nutheadDemoElement = document.getElementById('nuthead-demo');
	const nutheadDemo = nuthead.init(nutheadDemoElement, () => {
		console.log('hello world!');
	}, '../data');
});
