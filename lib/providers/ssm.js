import { path, isNil } from '@meltwater/phi'

export class SsmProvider {
  constructor({ ssmClient }) {
    this.client = ssmClient
  }

  async get(parameterName) {
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
