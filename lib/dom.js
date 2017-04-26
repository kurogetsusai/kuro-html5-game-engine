/** @module lib/dom */
'use strict';

define(() => {
	return {
		/** Creates all HTML canvas elements and adds them to the container element.
		 * @param {element} containerElement container element
		 * @returns {object} object with all the canvas elements */
		setupContainer(containerElement) {
			const style = document.createElement('style');

			style.type = 'text/css';
			style.innerHTML = `
.nutheadContainer {
	position: relative;
}

.nutheadCanvas {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}
`;

			document.getElementsByTagName('head')[0].appendChild(style);

			return [
				'map',
				'entitiesUnder',
				'player',
				'entitiesOver',
				'ui'
			].reduce((accumulator, value) => {
				const element = document.createElement('canvas');

				element.className = 'nutheadCanvas';

				containerElement.appendChild(element);

				accumulator[value] = element;
				return accumulator;
			}, {});
		}
	};
});
