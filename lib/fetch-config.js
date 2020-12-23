import AWS from 'aws-sdk'
import cacheManager from 'cache-manager'
import mlabsLogger from '@meltwater/mlabs-logger'
import phi from '@meltwater/phi'

const { SSM, SecretsManager } = AWS
const { caching } = cacheManager
const { createLogger } = mlabsLogger
const { fromPairs, map, toPairs } = phi

export const fetchConfig = async ({
  configMap = {},
  keyMap = {},
  ssmClient = new SSM(),
  secretsManagerClient = new SecretsManager(),
  cache = caching(),
  log = createLogger()
} = {}) => {
  const providerDependencies = { ssmClient, secretsManagerClient }
  const paramRequests = toPairs(configMap)
  const getParameter = createGetParameter({ providerDependencies, cache, log })
  const paramResponses = await Promise.all(map(getParameter, paramRequests))
  return fromPairs(paramResponses)
}

const createGetParameter = ({
  providerDependencies,
  cache,
  log: parentLog
}) => async ([key, configValue]) => {
  const log = parentLog.child({
    configKey: key,
    configProvider: configValue.getProviderName()
  })
  try {
    log.info('start')
    const data = await configValue.get(providerDependencies)
    log.debug({ data }, 'data')
    log.info('done')
    return [key, data]
  } catch (err) {
    log.error({ err }, 'fail')
    throw err
  }
}
