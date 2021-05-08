import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

export class SsmProvider {
  #client = null

  constructor({ ssmClient = new SSMClient() } = {}) {
    this.#client = ssmClient
  }

  async get(parameterName) {
    const command = new GetParameterCommand({ Name: parameterName })
    try {
      const data = await this.#client.send(command)
      return data?.Parameter?.Value
    } catch (err) {
      if (err.name === 'ParameterNotFound') return
      throw err
    }
  }
}
