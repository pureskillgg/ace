import phi from '@meltwater/phi'

const { complement, either, isNilOrEmpty, isFunction, isNotArray, toJson } = phi

export class ConfigValue {
  constructor({ args, Provider } = {}) {
    if (isInvalidArgs(args)) {
      throw new Error(`Invalid or missing args, got ${toJson(args)}`)
    }

    if (isInvalidProvider(Provider)) {
      throw new Error(`Invalid or missing Provider, got ${toJson(Provider)}`)
    }

    this.args = args
    this.Provider = Provider
  }

  async get(providerDependencies) {
    const provider = new this.Provider(providerDependencies)
    return provider.get(...this.args)
  }
}

const isInvalidArgs = either(isNilOrEmpty, isNotArray)
const isInvalidProvider = complement(isFunction)
