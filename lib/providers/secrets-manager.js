import * as phi from '@meltwater/phi'

const { complement, isNil, isNonEmptyString, toJson } = phi

export class SecretsManagerProvider {
  #client = null

  constructor({ secretsManagerClient } = {}) {
    if (isNil(secretsManagerClient)) {
      throw new Error('Missing secretsManagerClient')
    }

    this.#client = secretsManagerClient
  }

  async get(secretId) {
    if (isInvalidSecretId(secretId)) {
      throw new Error(
        `Invalid or missing parameter name, got ${toJson(secretId)}`
      )
    }

    const data = await this.#client
      .getSecretValue({ SecretId: secretId })
      .promise()

    if (isNil(data)) {
      throw new Error(`No data returned for secret id ${toJson(secretId)}`)
    }

    const value = data.SecretString

    if (isNil(value)) {
      throw new Error(`No value returned for secret id ${toJson(secretId)}`)
    }

    return value
  }
}

const isInvalidSecretId = complement(isNonEmptyString)
