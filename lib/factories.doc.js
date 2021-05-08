/**
 * Create a local string parameter.
 * @function localString
 * @param {string} name Parameter name.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */

/**
 * Create an env string parameter.
 * The parameter name and alias will be set equal.
 * @function envString
 * @param {string} name Parameter name and alias.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */

/**
 * Create an AWS SSM string parameter.
 * @function ssmString
 * @param {string} name Parameter name.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */

/**
 * Create an AWS Secrets Manager string parameter.
 * @function secretsManagerString
 * @param {string} name Parameter name.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */
