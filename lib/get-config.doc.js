/**
 * Get the configuration.
 * @async
 * @function getConfig
 * @param {Object} [parameters={}]
 * @param {Object} [parameters.parameters={}] Parameters to fetch.
 * @param {Object} [parameters.aliases={}] Parameter key aliases.
 * @param {Object} [parameters.ssmClient=<ssmClient>] AWS SSMClient instance.
 * @param {Object} [parameters.secretsManagerClient=<secretsManagerClient>] AWS SecretsManagerClient instance.
 * @param {Object} [parameters.localParameters={}] Local parameter values.
 * @param {Object} [parameters.cache=<cache>] In-memory cache-manager cache.
 *        In order to cache values across multiple invocations,
 *        a cache must be passed in from the outer scope.
 * @param {Object} [parameters.log=<logger>] Pino compatible logger.
 * @returns {Promise<Object>} The config.
 */
