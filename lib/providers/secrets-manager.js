import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { isNil } from '@meltwater/phi'

export class SecretsManagerProvider {
  #client = null

  constructor({ secretsManagerClient } = {}) {
    if (isNil(secretsManagerClient)) {
      throw new Error('Missing secretsManagerClient')
    }

    this.#client = secretsManagerClient
  }

  async get(secretId) {
    const command = new GetSecretValueCommand({ SecretId: secretId })
    try {
      const data = await this.#client.send(command)
      return data?.SecretString
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') return
      throw err
    }
  }
}
