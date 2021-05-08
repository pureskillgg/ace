import {
  T,
  both,
  complement,
  defaultTo,
  identity,
  isFunction,
  isNil,
  isNotNil,
  isNonEmptyString,
  isNotBoolean,
  toJson
} from '@meltwater/phi'

export class Parameter {
  #fallback
  #parser
  #validator
  #Provider
  #provider = null

  constructor({
    name,
    alias,
    fallback,
    Provider,
    validator = T,
    parser = identity,
    isSensitive = false
  } = {}) {
    if (isInvalidName(name)) {
      throw new Error(`Invalid or missing name, got ${toJson(name)}`)
    }

    if (isInvalidAlias(alias)) {
      throw new Error(`Invalid alias, got ${toJson(alias)}`)
    }

    if (isInvalidProvider(Provider)) {
      throw new Error(`Invalid or missing Provider, got ${toJson(Provider)}`)
    }

    if (isInvalidIsSensitive(isSensitive)) {
      throw new Error(`Invalid isSensitive, got ${toJson(isSensitive)}`)
    }

    this.name = name
    this.alias = alias
    this.isSensitive = isSensitive
    this.#fallback = fallback
    this.#Provider = Provider
    this.#validator = validator
    this.#parser = parser
  }

  async get(key) {
    if (isNil(this.#provider)) {
      throw new Error('Must call initProvider before get')
    }

    if (isNil(key)) {
      throw new Error(`Missing key, got ${toJson(key)}`)
    }

    const data = await this.#getValueFromProvider(key)
    const value = this.#parse(key, data)
    this.#validate(key, value)
    return value
  }

  initProvider(...args) {
    if (isNil(this.#provider)) this.#provider = new this.#Provider(...args)
  }

  get providerName() {
    return this.#Provider.name
  }

  #getValueFromProvider = async (key) => {
    const data = await this.#provider.get(key)
    return defaultTo(this.#fallback, data)
  }

  #validate = (key, data) => {
    if (this.#validator(data)) return
    throw new ParameterValidationError(key, data)
  }

  #parse = (key, data) => {
    try {
      return this.#parser(data)
    } catch (err) {
      throw new ParameterParsingError(key, data, err)
    }
  }
}

export class ParameterValidationError extends Error {
  constructor(key, data) {
    super(`Invalid parameter value for ${key}, got ${toJson(data)}`)
    this.name = this.constructor.name
    this.code = 'err_parameter_validate'
    Error.captureStackTrace(this, this.constructor)
    this.key = key
    this.data = data
  }
}

export class ParameterParsingError extends Error {
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

const isInvalidName = complement(isNonEmptyString)
const isInvalidAlias = both(isNotNil, complement(isNonEmptyString))
const isInvalidProvider = complement(isFunction)
const isInvalidIsSensitive = isNotBoolean
