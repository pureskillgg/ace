import AWS from 'aws-sdk'
import cacheManager from 'cache-manager'
import mlabsLogger from '@meltwater/mlabs-logger'

const { SSM, SecretsManager } = AWS
const { caching } = cacheManager
const { createLogger } = mlabsLogger

export const fetchConfig = async ({
  configMap = {},
  keyMap = {},
  ssmClient = new SSM(),
  secretsManagerClient = new SecretsManager(),
  cache = caching(),
  log = createLogger()
} = {}) => {
  return {}
}
