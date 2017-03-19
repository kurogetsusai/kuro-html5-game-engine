/** @module lib/loader */
'use strict';

define(() => {
	const STATUS_LOADING   = 1;
	const STATUS_COMPLETED = 2;
	const STATUS_ERROR     = 3;
	const ERROR_PREFIX     = 'Loader: ';

	return {
		/** Load a resource asynchronously.
		 * @param {object} resources Nuthead's resources, the funciton will append the result to that object
		 * @param {string} dataPath path to the data directory
		 * @param {string} format resource's format
		 * @param {string} type resource's type
		 * @param {string} name resource's name
		 * @param {string} [variant] resource's variant
		 * @return {void} */
		load(resources, dataPath, format, type, name, variant) {
			const resource = {
				format: format,
				type: type,
				name: name,
				variant: variant,
				src: [dataPath, type, name].join('/') + (typeof variant === 'undefined' ? '' : '-' + variant) + '.' + format,
				status: STATUS_LOADING,
				file: null
			};

			switch (format) {
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
				throw TypeError(ERROR_PREFIX + 'load: invalid function parameter, unrecognized format');
			}

			resources.push(resource);
		},

		/** Load a resource asynchronously if it wasn't loaded before.
		 * @param {object} resources Nuthead's resources, the funciton will append the result to that object
		 * @param {string} dataPath path to the data directory
		 * @param {string} format resource's format
		 * @param {string} type resource's type
		 * @param {string} name resource's name
		 * @param {string} [variant] resource's variant
		 * @return {void} */
		loadOnce(resources, dataPath, format, type, name, variant) {
			if (!resources.some(resource =>
				resource.format  === format &&
				resource.type    === type   &&
				resource.name    === name   &&
				resource.variant === variant
			))
				this.load(resources, dataPath, format, type, name, variant);
		},

		/** Wait for all resources to load and then call a function.
		 * @param {object} resources Nuthead's resources
		 * @param {funciton} onSuccess function to call when all resources load successfully
		 * @param {funciton} onError function to call when at least one resource fails to load
		 * @param {number} [checkIntervalTime=100] time between each iteration of the checking loop
		 * @return {void} */
		waitForAllFiles(resources, onSuccess, onError, checkIntervalTime = 100) {
			const checkInterval = setInterval(() => {
				if (resources.some(resource => resource.status === STATUS_ERROR)) {
					clearInterval(checkInterval);
					let errorMessage = ERROR_PREFIX + 'cannot load some resources:';

					resources.forEach(resource => {
						let status = '?';

						switch (resource.status) {
						case STATUS_LOADING:
							status = 'LOADING';
							break;
						case STATUS_COMPLETED:
							status = 'COMPLETED';
							break;
						case STATUS_ERROR:
							status = 'ERROR';
							break;
						}

						errorMessage += `\n[${status}] ${resource.format}, ${resource.type}, ${resource.name}, ${resource.variant}`;
					});

					console.warn(errorMessage);
					onError();
				} else if (resources.every(resource => resource.status === STATUS_COMPLETED)) {
					clearInterval(checkInterval);
					onSuccess();
				}
			}, checkIntervalTime);
		}
	};
});
