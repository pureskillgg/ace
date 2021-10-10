import {
  both,
  fromJson,
  isInteger,
  isNonEmptyString,
  isNonNegative,
  noop
} from '@meltwater/phi'

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

export const secretsManagerJson = (name, fallback) =>
  new Parameter({
    Provider: SecretsManagerProvider,
    validator: noop,
    isSensitive: true,
    parser: fromJson,
    fallback,
    name
  })

export const ssmNonNegativeInt = (name, fallback) =>
  new Parameter({
    Provider: SsmProvider,
    validator: isNonNegativeInt,
    parser: parseNumber,
    fallback,
    name
  })

export const localNonNegativeInt = (name, fallback) =>
  new Parameter({
    Provider: LocalProvider,
    validator: isNonNegativeInt,
    parser: parseNumber,
    fallback,
    name
  })

const isNonNegativeInt = both(isInteger, isNonNegative)
const parseNumber = (v) => Number(v)
