/** @module lib/dom */
'use strict';

define(() => {
	return {
		/** Create all HTML canvas elements and add them to the container element.
		 * @param {element} containerElement container element
		 * @return {object} object with all the canvas elements */
		setupContainer(containerElement) {
			return [
				'map',
				'entitiesUnder',
				'player',
				'entitiesOver',
				'ui'
			].reduce((accumulator, value) => {
				const element = document.createElement('canvas');

				element.id = value;
				containerElement.appendChild(element);

				accumulator[value] = element;
				return accumulator;
			}, {});
		}
	};
});
