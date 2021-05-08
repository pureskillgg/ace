/**
 * AWS Secrets Manager provider.
 * @class SecretsManagerProvider
 * @param {Object} parameters
 * @param {Object} [parameters.secretsManagerClient=<secretsManagerClient>]
 *        Instance of a SecretsManagerClient from the AWS SDK.
 */

/**
 * Get the secret value.
 * @async
 * @function get
 * @memberof SecretsManagerProvider
 * @instance
 * @param {string} secretId Secret id.
 * @return {Promise<string>} Secret value.
 */
