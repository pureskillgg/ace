/**
 * Creates a local string parameter.
 * @function localString
 * @param {string} key Key (or alias) to read from local parameters.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */

/**
 * Creates an AWS SSM string parameter.
 * @function ssmString
 * @param {string} key Key (or alias) to read from AWS SSM parameter store.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */

/**
 * Creates an AWS Secrets Manager string parameter.
 * @function secretsManagerString
 * @param {string} key Key (or alias) to read from AWS Secrets Manager.
 * @param {string} [fallback] Fallback value if parameter is not found.
 * @returns {Parameter} The parameter instance.
 */
