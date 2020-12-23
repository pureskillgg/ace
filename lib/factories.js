import { Parameter } from './parameter.js'
import { SsmProvider } from './providers/ssm.js'
import { SecretsManagerProvider } from './providers/secrets-manager.js'

export const ssmString = (key) => new Parameter({
  Provider: SsmProvider,
  key
})

export const secretsManagerString = (key) => new Parameter({
  Provider: SecretsManagerProvider,
  key
})
