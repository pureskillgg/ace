import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

export class SsmProvider {
  #client

  constructor({ ssmClient = new SSMClient() } = {}) {
    this.#client = ssmClient
  }

  async get(parameterName) {
    // WithDecryption is a no-op for String parameters and returns the
    // decrypted value for SecureString; without it SecureString reads
    // return the raw KMS ciphertext.
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true
    })
    try {
      const data = await this.#client.send(command)
      return data?.Parameter?.Value
    } catch (err) {
      if (err.name === 'ParameterNotFound') return
      throw err
    }
  }
}
