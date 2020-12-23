import * as phi from '@meltwater/phi'

const { complement, isNil, isNonEmptyString, toJson } = phi

export class LocalProvider {
  #data = null

  constructor({ localParameters } = {}) {
    if (isNil(localParameters)) {
      throw new Error('Missing localParameters')
    }

    this.#data = localParameters
  }

  async get(parameterName) {
    if (isInvalidParameterName(parameterName)) {
      throw new Error(
        `Invalid or missing parameter name, got ${toJson(parameterName)}`
      )
    }

    const value = this.#data[parameterName]

    if (isNil(value)) {
      throw new Error(
        `No value returned for parameter ${toJson(parameterName)}`
      )
    }

    return value
  }
}

const isInvalidParameterName = complement(isNonEmptyString)
