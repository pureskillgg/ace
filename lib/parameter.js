import * as phi from '@meltwater/phi'

const {
  T,
  complement,
  isNil,
  isNilOrEmpty,
  isNotBoolean,
  isNotNil,
  identity,
  isFunction,
  toJson
} = phi

export class Parameter {
  #provider = null

  constructor({
    key,
    isSensitive = false,
    Provider,
    validator = T,
    parser = identity
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
  }

  async get(key = this.key) {
    if (isNil(this.#provider)) {
      throw new Error('Must call initProvider before get')
    }

    const data = await this.#provider.get(key)
    this.validate(key, data)
    return this.parse(key, data)
  }

  initProvider(...args) {
    if (isNotNil(this.#provider)) {
      throw new Error('Provider already initialized')
    }
    this.#provider = new this.Provider(...args)
  }

  getProviderName() {
    return this.Provider.name
  }

  validate(key, data) {
    if (this.validator(data)) return
    throw new Error(`Invalid parameter value for ${key}, got ${toJson(data)}`)
  }

  parse(key, data) {
    try {
      return this.parser(data)
    } catch (err) {
      throw new Error(
        `Failed to parse parameter value for ${key}, ${err.message}`
      )
    }
  }
}

const isInvalidKey = isNilOrEmpty
const isInvalidProvider = complement(isFunction)
const isInvalidIsSensitive = isNotBoolean
