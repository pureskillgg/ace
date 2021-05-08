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

  async get(secretId, fallback) {
    const command = new GetSecretValueCommand({ SecretId: secretId })
    const data = await this.#client.send(command)
    const value = data?.SecretString
    if (isNil(value)) return fallback
    return value
  }
}
