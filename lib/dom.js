/** @module lib/dom */
'use strict';

define(() => {
	return {
		/** Creates all HTML canvas elements and adds them to the container element.
		 * @param {element} containerElement container element
		 * @returns {object} object with all the canvas elements */
		setupContainer(containerElement) {
			return [
				'map',
				'entitiesUnder',
				'player',
				'entitiesOver',
				'ui'
			].reduce((accumulator, value) => {
				const element = document.createElement('canvas');

				containerElement.appendChild(element);

				accumulator[value] = element;
				return accumulator;
			}, {});
		}
	};
});
