import AWS from 'aws-sdk'
import cacheManager from 'cache-manager'
import mlabsLogger from '@meltwater/mlabs-logger'
import phi from '@meltwater/phi'

const { SSM, SecretsManager } = AWS
const { caching } = cacheManager
const { createLogger } = mlabsLogger
const { isNil } = phi

export const fetchConfig = async ({
  configMap = {},
  keyMap = {},
  ssmClient = new SSM(),
  secretsManagerClient = new SecretsManager(),
  cache = caching(),
  log = createLogger()
} = {}) => {
  const providerDependencies = { ssmClient, secretsManagerClient }
  const paramRequests = Object.entries(configMap)
  const getParameter = createGetParameter({
    providerDependencies,
    keyMap,
    cache,
    log
  })
  const paramResponses = await Promise.all(paramRequests.map(getParameter))
  return Object.fromEntries(paramResponses)
}

const createGetParameter = ({
  keyMap,
  providerDependencies,
  cache,
  log: parentLog
}) => async ([name, configValue]) => {
  const key = keyMap[name]
  const log = parentLog.child({
    configName: name,
    configKey: key,
    configProvider: configValue.getProviderName()
  })
  try {
    log.info('start')
    if (isNil(key)) throw new Error(`No matching key for ${name}`)
    const data = await configValue.get(providerDependencies)
    log.debug({ data }, 'data')
    log.info('done')
    return [key, data]
  } catch (err) {
    log.error({ err }, 'fail')
    throw err
  }
}
