// prototype: Hud //////////////////////////////////////////////////////////////

var Hud = function (application) {
	console.log('Hud instance created');

	if (typeof application !== 'object' || application == null)
		throw Error('Hud: constructor: application is required');

	// technical
	this.app = application;
	this.canvas;
	this.context;

	// data
	this.jail = {
		left  : 0,
		top   : 0,
		width : 0,
		height: 0
	};
	this.state = {
		userMenu: false
	};
	this.dialogue = {
		currentIndex: 0,
		selectedChoice: 0,
		items: [],
		onend: null // function
	};
	this.pauseMenu = {
		category: 'main',
		selected: 0,
		stack: [],
		items: [
			{
				label: 'CONTINUE',
				category: 'main',
				action: () => {
					this.app.mode = this.app.modePrev;
					this.app.nutcracker.resumeAll();
				}
			},
			{
				label: 'OPTIONS',
				category: 'main',
				action: () => {
					this.pauseMenu.stack.push({
						category: this.pauseMenu.category,
						selected: this.pauseMenu.selected
					});
					this.pauseMenu.category = 'options';
					this.pauseMenu.selected = 0;
				}
			},
			{
				label: 'FPS CAP: ' + (this.app.config.fpsCap === Infinity ? 'OFF' : this.app.config.fpsCap),
				category: 'options',
				id: 'options.fpsCap',
				action: () => {
					if (this.app.config.fpsCap < 120)
						this.app.config.fpsCap += 10;
					else if (this.app.config.fpsCap === Infinity)
						this.app.config.fpsCap = 10;
					else
						this.app.config.fpsCap = Infinity;
					this.pauseMenu.items.find(item => item.id === 'options.fpsCap').label =
					'FPS CAP: ' + (this.app.config.fpsCap === Infinity ? 'OFF' : this.app.config.fpsCap);
					this.app.draw();
				}
			},
			{
				label: 'BACK',
				category: 'options',
				action: () => {
					let target = this.pauseMenu.stack.pop();
					this.pauseMenu.category = target.category;
					this.pauseMenu.selected = target.selected;
				}
			}
		]
	};

	// fpsCounter
	this.fpsCounter = {
		startTime: 0,
		frameNumber: 0,
		value: 0,
		refreshValue: function () {
			this.frameNumber++;
			let d = new Date().getTime();
			let currentTime = (d - this.startTime) / 1000;
			let result = this.frameNumber / currentTime;

			if (currentTime > 1) {
				this.startTime = d;
				this.frameNumber = 0;
			}
			this.value = result;
			return result;
		}
	};
};

Hud.prototype.load = function () {
	// get canvas
	this.canvas  = this.app.canvasList.canvases['hud'];
	this.context = this.app.canvasList.contexts['hud'];

	this.setJail();
};

Hud.prototype.resize = function () {
	this.clear();
	this.setJail();
	this.draw();
};

Hud.prototype.setJail = function () {
	this.jail.left   = parseInt((this.canvas.width - this.app.config.window.width) / 2);
	this.jail.top    = parseInt((this.canvas.height - this.app.config.window.height) / 2);
	this.jail.width  = this.app.config.window.width;
	this.jail.height = this.app.config.window.height;
};

Hud.prototype.clear = function () {
	this.context.clearRect(
		0,
		0,
		this.canvas.width,
		this.canvas.height
	);
};

Hud.prototype.draw = function () {
	if (this.state.userMenu)
		this.drawUserMenu();
	this.drawDialogue();

	switch (this.app.mode) {
	case 'pause':
		this.drawPauseMenu();
	}

	if (this.app.config.debug.enabled)
		this.drawDebugInfo();
};

Hud.prototype.redraw = function () {
	this.clear();
	this.draw();
};

Hud.prototype.toggleUserMenu = function () {
	this.state.userMenu = !this.state.userMenu;
};

Hud.prototype.drawDebugInfo = function () {
	// draw jail borders
	this.context.fillStyle = 'rgba(0, 0, 0, .1)';
	if (this.jail.left < 1) {
		this.context.fillRect(
			0,
			0,
			this.jail.width,
			this.jail.top
		);
		this.context.fillRect(
			0,
			this.jail.top + this.jail.height,
			this.canvas.width,
			this.canvas.height - this.jail.top - this.jail.height
		);
	} else {
		this.context.fillRect(
			0,
			0,
			this.jail.left,
			this.jail.height
		);
		this.context.fillRect(
			this.jail.left + this.jail.width,
			0,
			this.canvas.width - this.jail.left - this.jail.width,
			this.canvas.height
		);
	}

	// draw debug HUD
	switch (this.app.mode) {
	case 'pause':
		break;
	default:
		this.context.fillStyle = 'rgba(0, 127, 127, .8)';
		this.context.fillRect(0, 0, 282, 40);
	}

	this.app.fontList.draw(
		'FPS ' + this.fpsCounter.value.toFixed(2) +
		'\nRES ' + this.app.canvasList.canvases['player'].width + 'x' + this.app.canvasList.canvases['player'].height +
		'\nKEY ' + this.app.lastPressedKey,
		'basic', 'white', 6, 4
	);

	this.app.fontList.draw(
		'MAP NAME   ' +
		'\nMAP SIZE   ' +
		'\nMAP OFFSET ',
		'basic', 'white', 115, 4
	);

	this.app.fontList.draw(
		this.app.map.name +
		'\n' + this.app.map.width + 'x' + this.app.map.height +
		'\n' + parseInt(this.app.map.left) + 'x' + parseInt(this.app.map.top),
		'basic', 'white', 210, 4
	);

//	app.fontList.draw(
//		'1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM\nqwertyuiop\nasdfghjkl\nzxcvbnm\n `-=[]\\;\',./~!@\n#$%^&*()_+{}\n|:"<>?⯈ ',
//		'basic', 'white', 50, 50
//	);
//	app.fontList.draw(
//		'0123456789\nABCDEFGHIJ\nKLMNOPQRS\nTUVWXYZ\nabcdefghij\nklmnopqrs\ntuvwxyz',
//		'basic', 'white', 150, 50
//	);
};

Hud.prototype.drawPauseMenu = function () {
	// background
	this.context.fillStyle = 'rgba(0, 0, 0, .9)';
	this.context.fillRect(
		0,
		0,
		this.canvas.width,
		this.canvas.height
	);

	// calc text size
	let menuText = '';
	let itemCount = 0;
	this.pauseMenu.items.forEach(item => {
		if (this.pauseMenu.category !== item.category)
			return;

		if (itemCount > 0)
			menuText += '\n';

		menuText += (this.pauseMenu.selected === itemCount ? '⯈' : ' ') + item.label;
		++itemCount;
	});
	let menuTextSize = this.app.fontList.getTextSize(menuText, 'basic');

	// draw text
	let topMargin = '';
	itemCount = 0;
	this.pauseMenu.items.forEach(item => {
		if (this.pauseMenu.category !== item.category)
			return;

		this.app.fontList.draw(
			topMargin + (this.pauseMenu.selected === itemCount ? '⯈' : ' ') + item.label,
			'basic', (this.pauseMenu.selected === itemCount ? 'teal' : 'white'),
			parseInt((this.jail.width - menuTextSize.width) / 2 + this.jail.left),
			parseInt((this.jail.height - menuTextSize.height) / 2 + this.jail.top)
		);
		topMargin += '\n';
		++itemCount;
	});
};

Hud.prototype.drawBox = function (options) {
	let defaults = {
		posX: 0,
		posY: 0,
		height: 'auto',
		width: 'auto',
		growUp: false,
		growLeft: false,
		boxMargin: 5,
		boxBorder: 3,
		textMargin: 8,
		choiceMargin: 4,
		defaultFontName: 'basic',
		defaultFontVariant: 'white',
		defaultSelectedFontName: 'basic',
		defaultSelectedFontVariant: 'teal',
		texts: [
			/* {
			 * 	*text: String,
			 * 	 fontName: String,
			 * 	 fontVariant: String,
			 * 	 selectedFontName: String,
			 * 	 selectedFontVariant: String,
			 * 	 posX: Number,
			 * 	 posY: Number,
			 * 	 growBox: Boolean
			 * }
			 */
		]
	};

	options = Object.assign(defaults, options);

	let menuRect = {
		posX  : options.posX,
		posY  : options.posY,
		width : tools.isNumeric(options.width)  ? options.width  : 0,
		height: tools.isNumeric(options.height) ? options.height : 0
	};

	// add boxMargin
	menuRect.posX += options.boxMargin * (options.growLeft ? -1 : 1);
	menuRect.posY += options.boxMargin * (options.growUp ? -1 : 1);
	if (options.width !== 'auto')
		menuRect.width -= options.boxMargin * 2;
	if (options.height !== 'auto')
		menuRect.height -= options.boxMargin * 2;

	// functions
	let growWidth = width => {
		if (options.width === 'auto') {
			menuRect.width += width;
			if (options.growLeft)
				menuRect.posX -= width;
		}
	};
	let growHeight = height => {
		if (options.height === 'auto') {
			menuRect.height += height;
			if (options.growUp)
				menuRect.posY -= height;
		}
	};

	// add boxBorder
	growWidth(options.boxBorder * 2);
	growHeight(options.boxBorder * 2);

	// add text margin
	if (options.texts.length > 0) {
		growWidth(options.textMargin * 2);
		growHeight(options.textMargin * 2);
	}

	// add texts
	let first = true;
	options.texts.forEach(text => {
		if (text.growBox === false)
			return;

		let textSize = this.app.fontList.getTextSize(
			text.text,
			text.fontName || options.defaultFontName,
			text.marginX,
			text.marginY
		);
		growWidth(textSize.width);
		growHeight(textSize.height + (first ? 0 : (text.marginY || this.app.fontList.defaultMarginY)));
		first = false;
	});

	// add choice margin
	if (typeof options.choices !== 'undefined' && options.choices.length > 0) {
		growWidth(options.choiceMargin * 2);
		growHeight(options.choiceMargin * 2);
	}

	// add choices
	for (let i in options.choices) {
		let choice = options.choices[i];
		let selected = this.dialogue.selectedChoice === parseInt(i);

		if (choice.growBox === false)
			return;

		let textSize = this.app.fontList.getTextSize(
			(selected ? '⯈' : ' ') + choice.text,
			(selected ? choice.selectedFontName || options.defaultSelectedFontName :
			            choice.fontName         || options.defaultFontName),
			choice.marginX,
			choice.marginY
		);
		textSize.width += options.choiceMargin;
		growWidth(textSize.width);
		growHeight(textSize.height + (first ? 0 : (choice.marginY || this.app.fontList.defaultMarginY)));
		first = false;
	}

	// drawing

	// box border
	this.context.fillStyle = 'rgba(255, 255, 255, .9)';
	this.context.fillRect(
		menuRect.posX,
		menuRect.posY,
		menuRect.width,
		menuRect.height
	);
	// box background
	this.context.clearRect(
		menuRect.posX   + options.boxBorder,
		menuRect.posY   + options.boxBorder,
		menuRect.width  - options.boxBorder * 2,
		menuRect.height - options.boxBorder * 2
	);
	this.context.fillStyle = 'rgba(0, 0, 0, .9)';
	this.context.fillRect(
		menuRect.posX   + options.boxBorder,
		menuRect.posY   + options.boxBorder,
		menuRect.width  - options.boxBorder * 2,
		menuRect.height - options.boxBorder * 2
	);
	// texts
	let textTop = 0;
	options.texts.forEach(text => {
		this.app.fontList.draw(
			text.text,
			text.fontName || options.defaultFontName,
			text.fontVariant || options.defaultFontVariant,
			menuRect.posX + options.boxBorder + options.textMargin + (text.posX || 0),
			menuRect.posY + options.boxBorder + options.textMargin + (text.posY || 0)
			              + (text.growBox === false ? 0 : textTop),
			text.marginX,
			text.marginY
		);

		// adjust next text's position
		textTop += this.app.fontList.getTextSize(
			text.text,
			text.fontName || options.defaultFontName,
			text.marginX,
			text.marginY
		).height + (text.marginY || this.app.fontList.defaultMarginY);
	});
	// choices
	for (let i in options.choices) {
		let choice = options.choices[i];
		let selected = this.dialogue.selectedChoice === parseInt(i);

		this.app.fontList.draw(
			(selected ? '⯈' : ' ') + choice.text,
			(selected ? choice.selectedFontName || options.defaultSelectedFontName :
			            choice.fontName         || options.defaultFontName),
			(selected ? choice.selectedFontVariant || options.defaultSelectedFontVariant :
			            choice.fontVariant         || options.defaultFontVariant),
			menuRect.posX + options.boxBorder + options.textMargin + options.choiceMargin + (choice.posX || 0),
			menuRect.posY + options.boxBorder + options.textMargin + options.choiceMargin + (choice.posY || 0)
			              + (choice.growBox === false ? 0 : textTop) ,
			choice.marginX,
			choice.marginY
		);

		// adjust next text's position
		textTop += this.app.fontList.getTextSize(
			(selected ? '⯈' : ' ') + choice.text,
			(selected ? choice.selectedFontName || options.defaultSelectedFontName :
			            choice.fontName         || options.defaultFontName),
			choice.marginX,
			choice.marginY
		).height + (choice.marginY || this.app.fontList.defaultMarginY);
	}
};

Hud.prototype.drawUserMenu = function () {
	// calc things to set the box size manually
	let playerNameTextSize   = this.app.fontList.getTextSize(this.app.player.label, 'basic');
	let statsLabelsTextSize  = this.app.fontList.getTextSize('HP\nXP', 'basic');
	let statsNumbersTextSize = this.app.fontList.getTextSize(this.app.player.stats.hp + '\n' + this.app.player.stats.xp, 'basic');
	let itemsLabelTextSize   = this.app.fontList.getTextSize('Items:', 'basic');

	let texts = [];
	let top = 0;
	let boxWidth = 10;
	if (playerNameTextSize.width > boxWidth)
		boxWidth = playerNameTextSize.width;
	if (statsLabelsTextSize.width + 10 + statsNumbersTextSize.width > boxWidth)
		boxWidth = statsLabelsTextSize.width + 10 + statsNumbersTextSize.width;

	texts.push({
		text: this.app.player.label,
		posX: 0,
		posY: top,
		growBox: false
	});
	top += playerNameTextSize.height + 8;

	texts.push({
		text: 'HP\nXP',
		posX: 0,
		posY: top,
		growBox: false
	});
	texts.push({
		text: this.app.player.stats.hp + '\n' + this.app.player.stats.xp,
		posX: statsLabelsTextSize.width + 10,
		posY: top,
		growBox: false
	});
	top += statsLabelsTextSize.height + 8;
	texts.push({
		text: 'Items:',
		posX: 0,
		posY: top,
		growBox: false
	});
	top += itemsLabelTextSize.height;

	if (this.app.player.inventory.length > 0) {
		this.app.player.inventory.forEach(item => {
			top += 8;
			let textSize = this.app.fontList.getTextSize(' ' + item.name, 'basic');
			texts.push({
				text: ' ' + item.name,
				posX: 0,
				posY: top,
				growBox: false
			});
			top += textSize.height;
			if (textSize.width > boxWidth)
				boxWidth = textSize.width;
		});
	} else {
		top += 8;
		let textSize = this.app.fontList.getTextSize(' (no items)', 'basic');
		texts.push({
			text: ' (no items)',
			posX: 0,
			posY: top,
			growBox: false
		});
		top += textSize.height;
		if (textSize.width > boxWidth)
			boxWidth = textSize.width;
	}

	boxWidth += 32;
	let boxHeight = top + 32;

	this.drawBox({
		posX: this.jail.left,
		posY: this.jail.top,
		width: boxWidth,
		height: boxHeight,
		texts: texts
	});
};

Hud.prototype.setDialogue = function (options) {
	this.dialogue.currentIndex = 0;
	this.dialogue.selectedChoice = 0;
	this.dialogue.items = options.map(item => Object.assign({
		posX: this.jail.left,
		posY: this.jail.top + this.jail.height,
		width: this.jail.width,
		growUp: true,
		texts: [
			{
				text: 'A wild lobster appeared!\nOh wait...\nNevermind, it\'s just a squirrel. Ekk ekk!'
			}
		]
	}, item));
	this.dialogue.onend = options.onend;

	this.app.player.tryingToMoveHorz = 'none';
	this.app.player.tryingToMoveVert = 'none';
	this.app.modePrev = this.app.mode;
	this.app.mode = 'game-ui';
	this.redraw();
};

Hud.prototype.resetDialogue = function (options) {
	this.dialogue.currentIndex = 0;
	this.dialogue.selectedChoice = 0;
	this.dialogue.items = [];
	this.dialogue.onend = null;

	this.app.modePrev = this.mode;
	this.app.mode = 'game';
};

Hud.prototype.drawDialogue = function () {
	if (this.dialogue.items.length < 1)
		return;

	this.drawBox(this.dialogue.items[this.dialogue.currentIndex]);
};
