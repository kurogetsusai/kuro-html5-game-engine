/** @module lib/map */
'use strict';

define(['lib/loader', 'lib/tools'], (loader, tools) => {
	const STATUS_DEFINED = 0;
	const STATUS_LOADED  = 1;

	return {
		/** Stringifies a map status.
		 * @param {number} status map's status
		 * @returns {string} status' name */
		stringifyStatus(status) {
			switch (status) {
			case STATUS_DEFINED:
				return 'defined';
			case STATUS_LOADED:
				return 'loaded';
			default:
				return 'unknown';
			}
		},

		/** Finds a map in a given array of maps.
		 * @param {array} maps array of map objects
		 * @param {string} name map's name
		 * @param {string} [variant] map's variant
		 * @returns {object|undefined} map object or undefined */
		getMap(maps, name, variant) {
			return maps.find(map =>
				map.name    === name &&
				map.variant === variant
			);
		},

		/** Creates a map object.
		 * @param {object} resource resource object
		 * @param {string} [variant] map's variant
		 * @returns {object|undefined} map object or undefined */
		createMap(resource, variant) {
			if (typeof resource !== 'object' ||
			    resource.format !== 'json'   ||
			    resource.type   !== 'map'    ||
			   !loader.hasResourceLoaded(resource))
				return undefined;

			return Object.assign(
				tools.cloneJSON(resource.file),
				{
					name: resource.name,
					variant: variant,
					status: STATUS_DEFINED
				}
			);
		},

		/** Inserts entities' data into a map object. Assumes entities' resources are already loaded.
		 * @param {array} resources array of resource objects
		 * @param {object} map map object
		 * @returns {void} */
		injectEntities(resources, map) {
			if (map.status !== STATUS_DEFINED)
				return;

			map.entities = map.entities.map(entityDefinition => {
				const entity = loader.getResource(resources, 'json', 'entity', entityDefinition.name) || {};

				return Object.assign(
					tools.cloneJSON(entity),
					entityDefinition
				);
			});
			map.status = STATUS_LOADED;
		}
	};
});
