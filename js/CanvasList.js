// prototype: CanvasList ///////////////////////////////////////////////////////

var CanvasList = function (application) {
	console.log('CanvasList instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('CanvasList: constructor: application is required');

	// technical
	this.app = application;

	// data
	this.canvases = {};
	this.contexts = {};
};

CanvasList.prototype.addCanvas = function (name, canvas) {
	console.log('CanvasList: adding canvas "' + name + '", object: "' + canvas + '"');

	// add canvas
	this.canvases[name] = canvas;
};

CanvasList.prototype.addContext = function (name, context) {
	console.log('CanvasList: adding context "' + name + '", object: "' + context + '"');

	// add context
	this.contexts[name] = context;
};

CanvasList.prototype.initContext = function (context) {
	// imageSmoothingEnabled
	if (typeof context.imageSmoothingEnabled !== 'undefined')
		context.imageSmoothingEnabled = false;
	if (typeof context.mozImageSmoothingEnabled !== 'undefined')
		context.mozImageSmoothingEnabled = false;
	if (typeof context.oImageSmoothingEnabled !== 'undefined')
		context.oImageSmoothingEnabled = false;
	if (typeof context.webkitImageSmoothingEnabled !== 'undefined')
		context.webkitImageSmoothingEnabled = false;
};

CanvasList.prototype.resizeAll = function (ignoreHud) {
	// resize all canvases to match window size
	for (let i in this.canvases) {
		if (ignoreHud && i === 'hud')
			continue;

		// if the screen is 4:3 or wider
		if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
			this.canvases[i].width  = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
			this.canvases[i].height = this.app.config.window.height;
		// if it's not (some squares or portrait resolutions...?)
		} else {
			this.canvases[i].width  = this.app.config.window.width;
			this.canvases[i].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
		}
	}

	for (let i in this.contexts)
		this.initContext(this.contexts[i]);
};

CanvasList.prototype.resizeAllWithoutFlicker = function (ignoreHud) {
	// temp canvas
	let tempCanvas  = document.createElement('canvas');
	let tempContext = tempCanvas.getContext('2d');

	// resize all canvases to match window size
	for (let i in this.canvases) {
		if (ignoreHud && i === 'hud')
			continue;

		// copy canvas' context
		tempCanvas.width  = this.canvases[i].width;
		tempCanvas.height = this.canvases[i].height;
		tempContext.drawImage(this.canvases[i], 0, 0);

		// if the screen is 4:3 or wider
		if (window.innerHeight / window.innerWidth <= this.app.config.window.height / this.app.config.window.width) {
			this.canvases[i].width  = (this.app.config.window.height * window.innerWidth) / window.innerHeight;
			this.canvases[i].height = this.app.config.window.height;
		// if it's not (some squares or portrait resolutions...?)
		} else {
			this.canvases[i].width  = this.app.config.window.width;
			this.canvases[i].height = (this.app.config.window.width * window.innerHeight) / window.innerWidth;
		}

		// restore old context
		this.contexts[i].drawImage(tempCanvas, 0, 0);
	}
};

CanvasList.prototype.render = function (context, data, cropX, cropY, cropWidth, cropHeight, centerX, centerY, posX, posY, width, height, flipX = false, flipY = false, rotate = 0) {
	// check if translating, saving and restoring context is necessary
	if (flipX || flipY || rotate !== 0) {
		// transform context
		context.save();
		context.translate(posX, posY);
		context.rotate(rotate * Math.PI);
		context.scale(
			flipX ? -1 : 1,
			flipY ? -1 : 1
		);
		// draw
		if (typeof data === 'object') {
			context.drawImage(
				data,
				cropX,
				cropY,
				cropWidth,
				cropHeight,
				-centerX,
				-centerY,
				width,
				height
			);
		} else if (data === 'fill') {
			context.fillRect(
				-centerX + (cropX > 0 ? cropX : 0),
				-centerY + (cropY > 0 ? cropY : 0),
				(cropWidth  > 0 ? cropWidth  : 0),
				(cropHeight > 0 ? cropHeight : 0)
			);
		} else if (data === 'clear') {
			// if the sprite is rotated, add some extra pixels on
			// all sides, because browsers sometimes use
			// antialiasing when rotating, even if it's disabled,
			// so the result is shitty and may be slightly larger
			if (rotate !== 0) {
				context.clearRect(
					-centerX + (cropX > 0 ? cropX : 0) - 1,
					-centerY + (cropY > 0 ? cropY : 0) - 1,
					(cropWidth  > 0 ? cropWidth  : 0) + 2,
					(cropHeight > 0 ? cropHeight : 0) + 2
				);
			} else {
				context.clearRect(
					-centerX + cropX,
					-centerY + cropY,
					cropWidth,
					cropHeight
				);
			}
		} else {
			console.warn('Error: Can\'t draw object, unrecognized type: ', data);
		}
		context.restore();
	} else {
		// no transformations, just draw
		if (typeof data === 'object') {
			context.drawImage(
				data,
				cropX,
				cropY,
				cropWidth,
				cropHeight,
				posX - centerX,
				posY - centerY,
				width,
				height
			);
		} else if (data === 'fill') {
			context.fillRect(
				posX - centerX + (cropX > 0 ? cropX : 0),
				posY - centerY + (cropY > 0 ? cropY : 0),
				(cropWidth  > 0 ? cropWidth  : 0),
				(cropHeight > 0 ? cropHeight : 0)
			);
		} else if (data === 'clear') {
			context.clearRect(
				posX - centerX + (cropX > 0 ? cropX : 0),
				posY - centerY + (cropY > 0 ? cropY : 0),
				(cropWidth  > 0 ? cropWidth  : 0),
				(cropHeight > 0 ? cropHeight : 0)
			);
		} else {
			console.warn('Error: Can\'t draw object, unrecognized type: ', data);
		}
	}
}
