import AWS from 'aws-sdk'
import cacheManager from 'cache-manager'
import mlabsLogger from '@meltwater/mlabs-logger'
import { isNil } from '@meltwater/phi'

const { SSM, SecretsManager } = AWS
const { caching } = cacheManager
const { createLogger } = mlabsLogger

export const getConfig = async ({
  parameters = {},
  aliases = {},
  ssmClient = new SSM(),
  secretsManagerClient = new SecretsManager(),
  localParameters = {},
  cache = caching(),
  log = createLogger()
} = {}) => {
  const providerDependencies = {
    ssmClient,
    secretsManagerClient,
    localParameters
  }

  const getParameter = createGetParameter({
    providerDependencies,
    aliases,
    cache,
    log
  })

  const paramRequests = Object.entries(parameters)
  const paramResponses = await Promise.all(paramRequests.map(getParameter))
  return Object.fromEntries(paramResponses)
}

const createGetParameter = ({
  aliases,
  providerDependencies,
  cache,
  log: parentLog
}) => async ([name, parameter]) => {
  const alias = parameter.key
  const key = aliases[alias]
  const log = parentLog.child({
    paramName: name,
    paramAlias: alias,
    paramKey: key,
    paramProvider: parameter.getProviderName()
  })
  try {
    log.info('start')
    if (isNil(key)) throw new Error(`No matching key for alias ${alias}`)
    parameter.initProvider(providerDependencies)
    const data = await cache.wrap(name, () => parameter.get(key))
    log.debug({ data: parameter.isSensitive ? '[Redacted]' : data }, 'data')
    log.info('end')
    return [name, data]
  } catch (err) {
    log.error({ err }, 'fail')
    throw err
  }
}
