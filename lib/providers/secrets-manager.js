import { prop, isNil } from '@meltwater/phi'

export class SecretsManagerProvider {
  constructor({ secretsManagerClient }) {
    this.client = secretsManagerClient
  }

  async get(secretId) {
    const data = await this.client
      .getSecretValue({ SecretId: secretId })
      .promise()

    if (isNil(data)) {
      throw new Error(`No data returned for secret id ${secretId}`)
    }

    const value = prop('SecretString', data)

    if (isNil(value)) {
      throw new Error(`No value returned for secret id ${secretId}`)
    }

    return value
  }
}
