import * as phi from '@meltwater/phi'

import { Parameter } from './parameter.js'
import { SsmProvider } from './providers/ssm.js'
import { SecretsManagerProvider } from './providers/secrets-manager.js'
import { LocalProvider } from './providers/local.js'

const { isNonEmptyString } = phi

export const localString = (key) =>
  new Parameter({
    Provider: LocalProvider,
    validator: isNonEmptyString,
    key
  })

export const ssmString = (key) =>
  new Parameter({
    Provider: SsmProvider,
    validator: isNonEmptyString,
    key
  })

export const secretsManagerString = (key) =>
  new Parameter({
    Provider: SecretsManagerProvider,
    validator: isNonEmptyString,
    isSensitive: true,
    key
  })
