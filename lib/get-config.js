import cacheManager from 'cache-manager'
import { createLogger } from '@meltwater/mlabs-logger'
import { propOr, isNotNil } from '@meltwater/phi'

const { caching } = cacheManager

export const getConfig = async ({
  parameters = {},
  aliases = {},
  cache = caching(),
  log = createLogger(),
  ...providerDependencies
} = {}) => {
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
  const paramName = parameter.name
  const paramAlias = parameter.alias
  const paramKey = getParamKey(parameter, aliases)
  const log = parentLog.child({
    paramName,
    paramAlias,
    paramKey,
    paramProvider: parameter.providerName
  })
  try {
    log.info('start')
    parameter.initProvider(providerDependencies)
    const data = await cache.wrap(name, () => parameter.get(paramKey))
    log.debug({ data: parameter.isSensitive ? '[Redacted]' : data }, 'data')
    log.info('end')
    return [name, data]
  } catch (err) {
    log.error({ err }, 'fail')
    throw err
  }
}

const getParamKey = (parameter, aliases) => {
  const { alias, name } = parameter
  if (isNotNil(alias)) return alias
  return propOr(name, name, aliases)
}
