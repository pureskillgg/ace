/**
 * Get the configuration.
 * All additional named parameters are passed to the initProvider
 * method of each parameter provider instance.
 * @async
 * @function getConfig
 * @param {Object} [parameters={}]
 * @param {Object} [parameters.parameters={}] Parameters to fetch.
 * @param {Object} [parameters.aliases={}] Parameter key aliases.
 * @param {Object} [parameters.cache=<cache>] In-memory cache-manager cache.
 *        In order to cache values across multiple invocations,
 *        a cache must be passed in from the outer scope.
 * @param {Object} [parameters.log=<logger>] Pino compatible logger.
 * @returns {Promise<Object>} The config.
 */
