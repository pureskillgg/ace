import phi from '@meltwater/phi'

const { T, complement, isNil, isNilOrEmpty, isNotNil, isFunction, toJson } = phi

export class Parameter {
  #provider = null

  constructor({ key, Provider, validator = T } = {}) {
    if (isInvalidKey(key)) {
      throw new Error(`Invalid or missing key, got ${toJson(key)}`)
    }

    if (isInvalidProvider(Provider)) {
      throw new Error(`Invalid or missing Provider, got ${toJson(Provider)}`)
    }

    this.key = key
    this.Provider = Provider
    this.validator = validator
  }

  async get(key = this.key) {
    if (isNil(this.#provider)) {
      throw new Error('Must call initProvider before get')
    }

    const data = await this.#provider.get(key)
    this.validate(key, data)
    return data
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
}

const isInvalidKey = isNilOrEmpty
const isInvalidProvider = complement(isFunction)
