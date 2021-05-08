import { SSMClient } from '@aws-sdk/client-ssm'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import cacheManager from 'cache-manager'
import { createLogger } from '@meltwater/mlabs-logger'
import { isNil } from '@meltwater/phi'

const { caching } = cacheManager

export const getConfig = async ({
  parameters = {},
  aliases = {},
  ssmClient = new SSMClient(),
  secretsManagerClient = new SecretsManagerClient(),
  localParameters = {},
  cache = caching(),
  log = createLogger()
} = {}) => {
  const providerDependencies = {
    ssmClient,
    secretsManagerClient,
    localParameters
  }

  const getKey = createGetKey({ aliases, cache })

  const getParameter = createGetParameter({
    providerDependencies,
    getKey,
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
  getKey,
  cache,
  log: parentLog
}) => async ([name, parameter]) => {
  const alias = parameter.key
  const key = await getKey(alias)
  const log = parentLog.child({
    paramName: name,
    paramAlias: alias,
    paramKey: key,
    paramProvider: parameter.providerName
  })
  try {
    log.info('start')
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

const createGetKey = ({ aliases, cache }) => async (alias) => {
  const key = await cache.wrap(`__alias__${alias}`, () => aliases[alias])
  if (isNil(key)) return alias
  return key
}
