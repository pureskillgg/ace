import {
  T,
  complement,
  defaultTo,
  identity,
  isFunction,
  isNil,
  isNilOrEmpty,
  isNotBoolean,
  toJson
} from '@meltwater/phi'

export class Parameter {
  #provider = null

  constructor({
    key,
    fallback,
    Provider,
    validator = T,
    parser = identity,
    isSensitive = false
  } = {}) {
    if (isInvalidKey(key)) {
      throw new Error(`Invalid or missing key, got ${toJson(key)}`)
    }

    if (isInvalidProvider(Provider)) {
      throw new Error(`Invalid or missing Provider, got ${toJson(Provider)}`)
    }

    if (isInvalidIsSensitive(isSensitive)) {
      throw new Error(`Invalid isSensitive, got ${toJson(isSensitive)}`)
    }

    this.key = key
    this.Provider = Provider
    this.validator = validator
    this.parser = parser
    this.isSensitive = isSensitive
    this.fallback = fallback
  }

  async get(key = this.key) {
    if (isNil(this.#provider)) {
      throw new Error('Must call initProvider before get')
    }

    const data = await this.#provider.get(key)
    const value = defaultTo(this.fallback, data)
    this.validate(key, value)
    return this.parse(key, value)
  }

  initProvider(...args) {
    if (isNil(this.#provider)) this.#provider = new this.Provider(...args)
  }

  getProviderName() {
    return this.Provider.name
  }

  validate(key, data) {
    if (this.validator(data)) return
    throw new ParameterValidateError(key, data)
  }

  parse(key, data) {
    try {
      return this.parser(data)
    } catch (err) {
      throw new ParameterParseError(key, data, err)
    }
  }
}

export class ParameterValidateError extends Error {
  constructor(key, data) {
    super(`Invalid parameter value for ${key}, got ${toJson(data)}`)
    this.name = this.constructor.name
    this.code = 'err_parameter_validate'
    Error.captureStackTrace(this, this.constructor)
    this.key = key
    this.data = data
  }
}

export class ParameterParseError extends Error {
  constructor(key, data, err) {
    super(
      `Failed to parse parameter value ${toJson(data)} for ${key}, ${
        err.message
      }`
    )
    this.name = this.constructor.name
    this.code = 'err_parameter_parse'
    Error.captureStackTrace(this, this.constructor)
    this.key = key
    this.data = data
    this.error = err
  }
}

const isInvalidKey = isNilOrEmpty
const isInvalidProvider = complement(isFunction)
const isInvalidIsSensitive = isNotBoolean
