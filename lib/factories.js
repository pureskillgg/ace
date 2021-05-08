import { isNonEmptyString } from '@meltwater/phi'

import { Parameter } from './parameter.js'
import { SsmProvider } from './providers/ssm.js'
import { SecretsManagerProvider } from './providers/secrets-manager.js'
import { LocalProvider } from './providers/local.js'

export const localString = (key, fallback) =>
  new Parameter({
    Provider: LocalProvider,
    validator: isNonEmptyString,
    fallback,
    key
  })

export const ssmString = (key, fallback) =>
  new Parameter({
    Provider: SsmProvider,
    validator: isNonEmptyString,
    fallback,
    key
  })

export const secretsManagerString = (key, fallback) =>
  new Parameter({
    Provider: SecretsManagerProvider,
    validator: isNonEmptyString,
    isSensitive: true,
    fallback,
    key
  })