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
  const getParameter = createGetParameter({
    providerDependencies,
    keyMap,
    cache,
    log
  })

  const paramRequests = Object.entries(configMap)
  const paramResponses = await Promise.all(paramRequests.map(getParameter))
  return Object.fromEntries(paramResponses)
}

const createGetParameter = ({
  keyMap,
  providerDependencies,
  cache,
  log: parentLog
}) => async ([name, configValue]) => {
  const alias = configValue.key
  const key = keyMap[alias]
  const log = parentLog.child({
    configName: name,
    configAlias: alias,
    configKey: key,
    configProvider: configValue.getProviderName()
  })
  try {
    log.info('start')
    if (isNil(key)) throw new Error(`No matching key for ${alias}`)
    const data = await configValue.get(key)
    log.debug({ data }, 'data')
    log.info('done')
    return [name, data]
  } catch (err) {
    log.error({ err }, 'fail')
    throw err
  }
}
