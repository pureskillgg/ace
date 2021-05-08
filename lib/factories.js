import { isNonEmptyString } from '@meltwater/phi'

import { Parameter } from './parameter.js'
import {
  EnvProvider,
  LocalProvider,
  SecretsManagerProvider,
  SsmProvider
} from './providers/index.js'

export const localString = (name, fallback) =>
  new Parameter({
    Provider: LocalProvider,
    validator: isNonEmptyString,
    fallback,
    name
  })

export const envString = (name, fallback) =>
  new Parameter({
    Provider: EnvProvider,
    validator: isNonEmptyString,
    fallback,
    alias: name,
    name
  })

export const ssmString = (name, fallback) =>
  new Parameter({
    Provider: SsmProvider,
    validator: isNonEmptyString,
    fallback,
    name
  })

export const secretsManagerString = (name, fallback) =>
  new Parameter({
    Provider: SecretsManagerProvider,
    validator: isNonEmptyString,
    isSensitive: true,
    fallback,
    name
  })
