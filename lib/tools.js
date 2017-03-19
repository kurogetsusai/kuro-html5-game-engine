/** @module lib/tools */
'use strict';

define({
	/** Stringify a variable. Similar to JSON.stringify, except the output
	 *  contains more information and is not a valid JSON.
	 * @param {*} variable variable to stringify
	 * @param {string|number} [space=\t] whitespace separator
	 * @return {string} stringified variable's value */
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
