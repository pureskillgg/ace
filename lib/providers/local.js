import { complement, isNil, isNonEmptyString, toJson } from '@meltwater/phi'

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
    return this.#data[parameterName]
  }
}

const isInvalidParameterName = complement(isNonEmptyString)
