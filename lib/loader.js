/** @module lib/loader */
'use strict';

define(() => {
	const ERROR_PREFIX     = 'Loader: ';
	const STATUS_DEFINED   = 0;
	const STATUS_LOADING   = 1;
	const STATUS_COMPLETED = 2;
	const STATUS_ERROR     = 3;

	return {
		/** Stringifies a resource status.
		 * @param {number} status resource's status
		 * @returns {string} status' name */
		stringifyStatus(status) {
			switch (status) {
			case STATUS_DEFINED:
				return 'defined';
			case STATUS_LOADING:
				return 'loading';
			case STATUS_COMPLETED:
				return 'completed';
			case STATUS_ERROR:
				return 'error';
			default:
				return 'unknown';
			}
		},

		/** Finds a resource in a given array of resources.
		 * @param {array} resources array of resources
		 * @param {string} format resource's format
		 * @param {string} type resource's type
		 * @param {string} name resource's name
		 * @param {string} [variant] resource's variant
		 * @returns {object|undefined} resource object or undefined */
		getResource(resources, format, type, name, variant) {
			return resources.find(resource =>
				resource.format  === format &&
				resource.type    === type   &&
				resource.name    === name   &&
				resource.variant === variant
			);
		},

		/** Checks if a resource is loading.
		 * @param {object} resource resource object
		 * @returns {boolean} true if the resource is loading, false otherwise */
		isResourceLoading(resource) {
			return typeof resource === 'object' &&
			       resource.status === STATUS_LOADING;
		},

		/** Checks if a resource has loaded.
		 * @param {object} resource resource object
		 * @returns {boolean} true if the resource has loaded, false otherwise */
		hasResourceLoaded(resource) {
			return typeof resource === 'object' &&
			       resource.status === STATUS_COMPLETED;
		},

		/** Checks if a resource has failed to load.
		 * @param {object} resource resource object
		 * @returns {boolean} true if object has failed, false otherwise */
		hasResourceFailed(resource) {
			return typeof resource === 'object' &&
			       resource.status === STATUS_ERROR;
		},

		/** Creates a resource with defined ID (format, type, name, [variant]).
		 * @param {string} format resource's format
		 * @param {string} type resource's type
		 * @param {string} name resource's name
		 * @param {string} [variant] resource's variant
		 * @returns {object} resource object */
		createResource(format, type, name, variant) {
			return {
				format: format,
				type: type,
				name: name,
				variant: variant,
				status: STATUS_DEFINED,
				src: null,
				file: null
			};
		},

		/** Loads a resource.
		 * @param {string} dataPath path to the data directory
		 * @param {object} resource object
		 * @returns {void} */
		loadResource(dataPath, resource) {
			resource.status = STATUS_LOADING;
			resource.src = [dataPath, resource.type, resource.name].join('/') +
			               (typeof resource.variant === 'undefined' ? '' : '-' + resource.variant) +
			               '.' + resource.format;

			switch (resource.format) {
			case 'json':
				const httpRequest = new XMLHttpRequest();

				httpRequest.onreadystatechange = () => {
					if (httpRequest.readyState !== 4)
						return;
					if (httpRequest.status === 200)
						try {
							resource.file   = JSON.parse(httpRequest.responseText);
							resource.status = STATUS_COMPLETED;
						} catch (e) {
							resource.status = STATUS_ERROR;
						}
					else
						resource.status = STATUS_ERROR;
				};
				httpRequest.open('GET', resource.src);
				httpRequest.send();
				break;
			case 'png':
				resource.file = new Image();
				resource.file.onload = () => {
					if ('naturalHeight' in this) {
						if (this.naturalHeight + this.naturalWidth === 0) {
							this.onerror();
							return;
						}
					} else if (this.width + this.height === 0) {
						this.onerror();
						return;
					}

					resource.status = STATUS_COMPLETED;
				};

				resource.file.onerror = () => {
					resource.status = STATUS_ERROR;
				};

				resource.file.src = resource.src;
				break;
			default:
				throw TypeError(ERROR_PREFIX + 'loadResource: invalid function parameter, unrecognized format');
			}
		},

		/** Waits for all resources to load and then calls a function.
		 * @param {object} resources Nuthead's resources
		 * @param {function} onSuccess function to call when all resources load successfully
		 * @param {function} onError function to call when at least one resource fails to load
		 * @param {number} [checkIntervalTime=100] time between each iteration of the checking loop
		 * @returns {void} */
		waitForAllFiles(resources, onSuccess, onError, checkIntervalTime = 100) {
			const checkInterval = setInterval(() => {
				if (resources.some(resource => this.hasResourceFailed(resource))) {
					clearInterval(checkInterval);
					let errorMessage = ERROR_PREFIX + 'cannot load some resources:';

					resources.forEach(resource => {
						errorMessage += `\n[${this.stringifyStatus(resource.status).toUpperCase()}] ` +
						`${resource.format}, ${resource.type}, ${resource.name}, ${resource.variant}`;
					});

					console.warn(errorMessage);
					onError();
				} else if (resources.every(resource => this.hasResourceLoaded(resource))) {
					clearInterval(checkInterval);
					onSuccess();
				}
			}, checkIntervalTime);
		}
	};
});
