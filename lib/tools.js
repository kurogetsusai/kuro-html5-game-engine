/** @module lib/tools */
'use strict';

define({
	/** Clones a variable containing a valid JSON value.
	 * @param {*} variable variable to clone
	 * @returns {*} cloned variable */
	cloneJSON(variable) {
		return JSON.parse(JSON.stringify(variable));
	},

	/** Checks if two arrays are the same (all their values are identical).
	 * @param {array} array1 first array
	 * @param {array} array2 second array
	 * @returns {boolean} true if the arrays are the same, otherwise false */
	sameArrays(array1, array2) {
		return array1.length === array2.length &&
		       array1.every((value, index) => value === array2[index]);
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
