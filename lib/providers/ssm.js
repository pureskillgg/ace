import { GetParameterCommand } from '@aws-sdk/client-ssm'
import { isNil } from '@meltwater/phi'

export class SsmProvider {
  #client = null

  constructor({ ssmClient } = {}) {
    if (isNil(ssmClient)) {
      throw new Error('Missing ssmClient')
    }

    this.#client = ssmClient
  }

  async get(parameterName) {
    const command = new GetParameterCommand({ Name: parameterName })
    const data = await this.#client.send(command)
    return data?.Parameter?.Value
  }
}
