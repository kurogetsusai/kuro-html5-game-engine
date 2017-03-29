/** @module nuthead */
'use strict';

define(['lib/dom', 'lib/loader', 'lib/map', 'lib/tools'], (dom, loader, map, tools) => {
	const ERROR_PREFIX = 'Nuthead: ';

	return class { // more like an interface with data
		/** Creates an instance of Nuthead.
		 * @param {element} containerElement Nuthead's container element
		 * @param {string} [dataPath] path to the data directory
		 * @returns {void} */
		constructor(containerElement, dataPath) {
			// store all data here
			this.state = {
				config: {
					dataPath: 'data',
					elements: {
						container: null
					}
				},
				data: {
					maps: []
				},
				map: null,
				resources: []
			};

			// init environment (canvas elements and shit)
			if (!(containerElement instanceof Element))
				throw TypeError(ERROR_PREFIX + 'init: invalid function parameter, containerElement must be a DOM element');

			this.state.config.elements.container = containerElement;
			if (typeof dataPath === 'string')
				this.state.config.dataPath = dataPath.trim().split('/').filter(item => item !== '').join('/');

			Object.assign(
				this.state.config.elements,
				dom.setupContainer(this.state.config.elements.container)
			);
		}

		/** Loads resources defined in an array of loader.createResource's parameters.
		 * @param {array} resourceDefinitions array of resource definitions
		 * @returns {Promise<array|Error>} a promise to the resources, resolves to an array of resource objects */
		loadResources(resourceDefinitions) {
			// remove duplicates
			resourceDefinitions = resourceDefinitions.reduce((accumulator, value) => {
				if (!accumulator.some(item => tools.sameArrays(item, value)))
					accumulator.push(value);
				return accumulator;
			}, []);

			return Promise.all(resourceDefinitions.map(item => {
				const resource = loader.createResource(...item);

				this.state.resources.push(resource);
				return loader.loadResource(this.state.config.dataPath, resource);
			}));
		}

		/** Loads a map.
		 * @param {string} name map's name
		 * @param {string} variant map's variant
		 * @returns {Promise<object|Error>} a promise to the map, resolves to a map object */
		loadMap(name, variant) {
			return new Promise((resolve, reject) => {
				let newMap = map.getMap(this.state.data.maps, name, variant);

				if (typeof newMap !== 'undefined') {
					this.state.map = newMap;
					resolve(this.state.map);
					return;
				}

				this.loadResources([
					['json', 'map', name],
					['png' , 'map', name, variant]
				]).then(() => {
					newMap = map.createMap(loader.getResource(this.state.resources, 'json', 'map', name));
					this.state.data.maps.push(newMap);
					this.state.map = newMap;

					this.loadResources(this.state.map.entities.reduce((accumulator, value) => {
						accumulator.push(['json', 'entity', value.name]);
						accumulator.push(['png' , 'entity', value.name, value.variant]);
						return accumulator;
					}, [])).then(() => {
						map.injectEntities(this.state.resources, this.state.map);
						resolve(this.state.map);
					}).catch(error => {
						console.warn(error.message);
						reject(new Error(ERROR_PREFIX + `cannot load map: ${name}, ${variant}`));
					});
				}).catch(error => {
					console.warn(error.message);
					reject(new Error(ERROR_PREFIX + `cannot load map: ${name}, ${variant}`));
				});
			});
		}
	};
});
