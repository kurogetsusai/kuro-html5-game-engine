/** @module lib/tools */
'use strict';

define({
	/** Clones a variable containing a valid JSON value.
	 * @param {*} variable variable to clone
	 * @returns {*} cloned variable */
	cloneJSON(variable) {
		return JSON.parse(JSON.stringify(variable));
	},

	/** Checks if arrays are the same (all their values are identical).
	 * Works for any number of arrays >= 2.
	 * @param {...arrays} arrays arrays to check
	 * @returns {boolean} true if all arrays are the same, otherwise false */
	sameArrays(...arrays) {
		return arrays.every(
			array => array.length === arrays[0].length &&
			         array.every((value, index) => value === arrays[0][index])
		);
	},

	/** Stringifies a variable. Similar to JSON.stringify, except the output
	 *  contains more information and is not a valid JSON.
	 * @param {*} variable variable to stringify
	 * @param {string|number} [space=\t] whitespace separator or number of spaces
	 * @returns {string} stringified variable's value */
	stringify(variable, space = '\t') {
		const prefix = 'stringify: ';

		return JSON.stringify(variable, (key, value) => {
			if (value instanceof Element)
				return `[${prefix}Element]`;
			else if (typeof value === 'function')
				return `[${prefix}Function]`;
			else if (typeof value === 'undefined')
				return `[${prefix}undefined]`;

			return value;
		}, space);
	}
});
