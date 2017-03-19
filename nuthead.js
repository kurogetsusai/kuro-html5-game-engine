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

		/** Init Nuthead.
		 * @param {element} containerElement Nuthead's container element
		 * @param {function} onReady function called when Nuthead loads
		 * @param {string} [dataPath] path to the data directory
		 * @return {void} */
		init(containerElement, onReady, dataPath) {
			if (!(containerElement instanceof Element))
				throw TypeError(ERROR_PREFIX + 'init: invalid function parameter, containerElement must be a DOM element');

			this.config.elements.container = containerElement;
			if (typeof dataPath === 'string')
				this.config.dataPath = dataPath.trim().split('/').join('/');

			Object.assign(
				this.config.elements,
				dom.setupContainer(this.config.elements.container)
			);

			loader.loadOnce(this.resources, this.config.dataPath, 'png' , 'entity', 'flower', 'blue');
			loader.loadOnce(this.resources, this.config.dataPath, 'json', 'entity', 'flower');
			loader.loadOnce(this.resources, this.config.dataPath, 'json', 'debug' , 'debug');
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
