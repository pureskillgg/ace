import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

export class SecretsManagerProvider {
  #client

  constructor({ secretsManagerClient = new SecretsManagerClient() } = {}) {
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
