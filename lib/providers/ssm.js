import { complement, isNil, isNonEmptyString, toJson } from '@meltwater/phi'

export class SsmProvider {
  #client = null

  constructor({ ssmClient } = {}) {
    if (isNil(ssmClient)) {
      throw new Error('Missing ssmClient')
    }

    this.#client = ssmClient
  }

  async get(parameterName) {
    if (isInvalidParameterName(parameterName)) {
      throw new Error(
        `Invalid or missing parameter name, got ${toJson(parameterName)}`
      )
    }

    const data = await this.#client
      .getParameter({ Name: parameterName })
      .promise()

    if (isNil(data)) {
      throw new Error(`No data returned for parameter ${toJson(parameterName)}`)
    }

    const value = data?.Parameter?.Value

    if (isNil(value)) {
      throw new Error(
        `No value returned for parameter ${toJson(parameterName)}`
      )
    }

    return value
  }
}

const isInvalidParameterName = complement(isNonEmptyString)
