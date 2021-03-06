'use strict';

requirejs.config({
	baseUrl: '..'
});

requirejs(['nuthead'], Nuthead => {
	const nutheadDemoElement = document.getElementById('nutheadDemo');
	const nutheadDemo = new Nuthead(nutheadDemoElement, '../data');

	nutheadDemo.loadMap('test').then(result => {
		console.log(result);
	}).catch(error => {
		console.log(error.message);
	});
});
