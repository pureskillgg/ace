import { complement, isNil, isNonEmptyString, toJson } from '@meltwater/phi'

export class LocalProvider {
  #data = null

  constructor({ localParameters } = {}) {
    if (isNil(localParameters)) {
      throw new Error('Missing localParameters')
    }

    this.#data = localParameters
  }

  async get(parameterName, fallback) {
    if (isInvalidParameterName(parameterName)) {
      throw new Error(
        `Invalid or missing parameter name, got ${toJson(parameterName)}`
      )
    }
    const value = this.#data[parameterName]
    if (isNil(value)) return fallback
    return value
  }
}

const isInvalidParameterName = complement(isNonEmptyString)
