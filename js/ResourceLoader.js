// prototype: ResourceLoader ///////////////////////////////////////////////////

var ResourceLoader = function (application) {
	console.log('ResourceLoader instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('ResourceLoader: constructor: application is required');

	this.app = application;
	this.resource = {
		/* object-array of {
		 * 	id: string
		 * 	parent: object
		 * 	format:
		 * 	type:
		 * 	name:
		 * 	variant:
		 * 	src:
		 * 	resource: Image() or {
		 * 		parent:
		 * 	}
		 * }
		 */
	};
	this.resourceStatus = {};
};

ResourceLoader.prototype.loadOnce = function (format, type, name, variant) {
	var id = format + '/' + type + '/' + name + (typeof variant === 'undefined' ? '' : '-' + variant);
	if (typeof this.resource[id] === 'undefined')
		this.load(format, type, name, variant);
};

ResourceLoader.prototype.load = function (format, type, name, variant) {
	var file = type + '/' + name + (typeof variant === 'undefined' ? '' : '-' + variant);
	var id = format + '/' + file;
	this.resource[id] = {};
	this.resource[id].id = id;
	this.resource[id].parent = this;
	this.resource[id].format = format;
	this.resource[id].type = type;
	this.resource[id].name = name;
	this.resource[id].variant = variant;
	this.resource[id].src = this.app.config.resourcePath + '/' + file;
	// ^^^ DON'T FORGET TO ADD AN EXTENSION WHEN CREATING NEW FORMAT
	console.log('ResourceLoader: loading resource ' + id);

	switch (format) {
	case 'image':
		// add an extension to file
		this.resource[id].src += '.png';

		// create new Image
		this.resource[id].file = new Image();
		// set status to 'loading'
		this.resourceStatus[id] = this.app.config.loaderStatus.loading;
		// set parent to be able to access resourceStatus from event functions
		this.resource[id].file.parent = this.resource[id];

		// when it is loaded, check if the image is OK
		// if it is, then set the status to 'completed', otherwise 'error'
		this.resource[id].file.onload = function () {
			if ('naturalHeight' in this) {
				if (this.naturalHeight + this.naturalWidth === 0) {
					this.onerror();
					return;
				}
			} else if (this.width + this.height == 0) {
				this.onerror();
				return;
			}

			this.parent.parent.resourceStatus[this.parent.id] = this.parent.parent.app.config.loaderStatus.completed;
		};

		// set the status to 'error'
		this.resource[id].file.onerror = function () {
			this.parent.parent.resourceStatus[this.parent.id] = this.parent.parent.app.config.loaderStatus.error;
		};

		// load the image
		this.resource[id].file.src = this.resource[id].src;

		break;
	case 'json':
	default:
		// add an extension to file
		this.resource[id].src += '.json';

		// set status to 'loading'
		this.resourceStatus[id] = this.app.config.loaderStatus.loading;

		// load the file
		var parent_obj = this;
		$.getJSON(this.resource[id].src, function (json) {
			parent_obj.resource[id].file = json;
			parent_obj.resourceStatus[id] = parent_obj.app.config.loaderStatus.completed;
		}).fail(function () {
			parent_obj.resourceStatus[id] = parent_obj.app.config.loaderStatus.error;
		});

		break;
	}
};

ResourceLoader.prototype.waitForAllFiles = function (callback_ok, callback_error) {
	// check if all files finished loading
	var parent_obj = this;
	var status = this.app.config.loaderStatus.loading;
	var interval = setInterval(function () {
		status = parent_obj.app.config.loaderStatus.completed;
		// loop through all imageStatuses
		for (var property in parent_obj.resourceStatus) {
			if (parent_obj.resourceStatus.hasOwnProperty(property)) {
				// halt on error
				if (parent_obj.resourceStatus[property] == parent_obj.app.config.loaderStatus.error) {
					status = parent_obj.app.config.loaderStatus.error;
					break;
				} else if (parent_obj.resourceStatus[property] == parent_obj.app.config.loaderStatus.loading) {
					status = parent_obj.app.config.loaderStatus.loading;
				}
			}
		}

		// check if there was any error
		if (status == parent_obj.app.config.loaderStatus.error) {
			clearInterval(interval);
			parent_obj.app.callback(callback_error);
		} else if (status == parent_obj.app.config.loaderStatus.completed) {
			clearInterval(interval);
			parent_obj.app.callback(callback_ok);
		} // else check next interval
	}, 100);
};
