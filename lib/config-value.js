import phi from '@meltwater/phi'

const { complement, isNil, isNilOrEmpty, isNotNil, isFunction, toJson } = phi

export class ConfigValue {
  constructor({ key, Provider } = {}) {
    if (isInvalidKey(key)) {
      throw new Error(`Invalid or missing key, got ${toJson(key)}`)
    }

    if (isInvalidProvider(Provider)) {
      throw new Error(`Invalid or missing Provider, got ${toJson(Provider)}`)
    }

    this.key = key
    this.Provider = Provider
  }

  async get() {
    if (isNil(this.provider)) {
      throw new Error('Must call initProvider before get')
    }

    return this.provider.get(this.key)
  }

  initProvider(...args) {
    if (isNotNil(this.provider)) throw new Error('Provider already initialized')
    this.provider = new this.Provider(...args)
  }

  getProviderName() {
    return this.Provider.name
  }
}

const isInvalidKey = isNilOrEmpty
const isInvalidProvider = complement(isFunction)
