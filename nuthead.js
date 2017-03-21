/** @module nuthead */
'use strict';

define(['lib/dom', 'lib/loader', 'lib/tools'], (dom, loader, tools) => {
	const ERROR_PREFIX = 'Nuthead: ';

	return {
		/** Nuthead's "instance" configuration. */
		config: {
			dataPath: 'data',
			elements: {
				container: null
			}
		},

		/** All the game data should be stored here. */
		data: {
			maps: []
		},

		/** All dynamically loaded resources. */
		resources: [],

		/** Inits Nuthead.
		 * @param {element} containerElement Nuthead's container element
		 * @param {function} onReady function called when Nuthead loads
		 * @param {string} [dataPath] path to the data directory
		 * @returns {void} */
		init(containerElement, onReady, dataPath) {
			if (!(containerElement instanceof Element))
				throw TypeError(ERROR_PREFIX + 'init: invalid function parameter, containerElement must be a DOM element');

			this.config.elements.container = containerElement;
			if (typeof dataPath === 'string')
				this.config.dataPath = dataPath.trim().split('/').filter(item => item !== '').join('/');

			Object.assign(
				this.config.elements,
				dom.setupContainer(this.config.elements.container)
			);

			[
				['png' , 'entity', 'flower', 'blue'],
				['json', 'entity', 'flower'],
				['json', 'debug' , 'debug']
			].map(item =>
				loader.createResource(...item)
			).forEach(resource => {
				this.resources.push(resource);
				loader.loadResource(this.config.dataPath, resource);
			});

			loader.waitForAllFiles(
				this.resources,
				() => console.log(tools.stringify(this.resources)),
				() => console.log(tools.stringify(this.resources))
			);

			if (typeof onReady === 'function')
				onReady();
		}
	};
});
