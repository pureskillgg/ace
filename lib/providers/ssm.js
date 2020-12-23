import { complement, path, isNil, isNonEmptyString } from '@meltwater/phi'

export class SsmProvider {
  constructor({ ssmClient } = {}) {
    if (isNil(ssmClient)) {
      throw new Error('Missing ssmClient')
    }

    this.client = ssmClient
  }

  async get(parameterName) {
    if (isInvalidParameterName(parameterName)) {
      throw new Error(`Invalid or missing parameter name, got ${parameterName}`)
    }

    const data = await this.client
      .getParameter({ Name: parameterName })
      .promise()

    if (isNil(data)) {
      throw new Error(`No data returned for parameter ${parameterName}`)
    }

    const value = path(['Parameter', 'Value'], data)

    if (isNil(value)) {
      throw new Error(`No value returned for parameter ${parameterName}`)
    }

    return value
  }
}

const isInvalidParameterName = complement(isNonEmptyString)
