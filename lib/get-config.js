import cacheManager from 'cache-manager'
import { createLogger } from '@meltwater/mlabs-logger'
import { isNil } from '@meltwater/phi'

const { caching } = cacheManager

export const getConfig = async ({
  parameters = {},
  aliases = {},
  cache = caching(),
  log = createLogger(),
  ...providerDependencies
} = {}) => {
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
  const alias = parameter.name
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
