/**
 * AWS SSM provider.
 * @class SsmProvider
 * @param {Object} parameters
 * @param {Object} [parameters.ssmClient=<ssmClient>]
 *        Instance of an SSMClient from the AWS SDK.
 */

/**
 * Get the parameter value.
 * @async
 * @function get
 * @memberof SsmProvider
 * @instance
 * @param {string} parameterName Parameter name.
 * @return {Promise<string>} Parameter value.
 */
