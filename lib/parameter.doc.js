/**
 * Parameter model.
 * @class Parameter
 * @param {Object} parameters
 * @param {string} parameters.key Key to lookup the parameter from the provider.
 * @param {string} [parameters.fallback] Fallback value if parameter value is
 *        null, undefined, or not found.
 * @param {string} parameters.Provider Constructor for the underlying provider.
 * @param {Function} [parameters.validator=<always-valid>] Boolean function that validates the parameter.
 * @param {Function} [parameters.parser=<identity>] Function to parse the parameter.
 * @param {Boolean} [parameters.isSensitive=false] If the parameter value is sensitive.
 */

/**
 * Get the parameter value.
 * @async
 * @function get
 * @memberof Parameter
 * @instance
 * @param {string} [key=this.key] Key to lookup the parameter from the provider.
 * @return {Promise<any>} Parameter value.
 * @throws {ParameterValidationError} Thrown when the parameter fails validation.
 * @throws {ParameterParsingError} Thrown when the parameter fails parsing.
 */

/**
 * Parameter validation error.
 * @class ParameterValidationError
 * @extends Error
 * @param {string} key Parameter key that failed validation.
 * @param {any} data Value that failed validation.
 * @property {string} key Parameter key that failed validation.
 * @property {any} data Value that failed validation.
 */

/**
 * Parameter parsing error.
 * @class ParameterParsingError
 * @extends Error
 * @param {string} key Parameter key that failed parsing.
 * @param {any} data Value that failed parsing.
 * @param {Error} err Parse error.
 * @property {string} key Parameter key that failed parsing.
 * @property {any} data Value that failed parsing.
 * @property {Error} error Parse error.
 */
