import { Parameter } from './parameter.js'
import { SsmProvider } from './providers/ssm.js'
import { SecretsManagerProvider } from './providers/secrets-manager.js'
import phi from '@meltwater/phi'

const { isNonEmptyString } = phi

export const ssmString = (key) =>
  new Parameter({
    Provider: SsmProvider,
    isValid: isNonEmptyString,
    key
  })

export const secretsManagerString = (key) =>
  new Parameter({
    Provider: SecretsManagerProvider,
    isValid: isNonEmptyString,
    key
  })
