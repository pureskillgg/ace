import { complement, prop, isNil, isNonEmptyString } from '@meltwater/phi'

export class SecretsManagerProvider {
  constructor({ secretsManagerClient } = {}) {
    if (isNil(secretsManagerClient)) {
      throw new Error('Missing secretsManagerClient')
    }

    this.client = secretsManagerClient
  }

  async get(secretId) {
    if (isInvalidSecretId(secretId)) {
      throw new Error(`Invalid or missing parameter name, got ${secretId}`)
    }

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

const isInvalidSecretId = complement(isNonEmptyString)
