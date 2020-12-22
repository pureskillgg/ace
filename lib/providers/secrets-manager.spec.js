import test from 'ava'
import * as td from 'testdouble'

import { SecretsManagerProvider } from './secrets-manager.js'

test('get: returns secret value if found', async (t) => {
  const secretsManagerClient = td.object(['getSecretValue'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'
  const secretValue = 'secret-value'

  td.when(
    secretsManagerClient.getSecretValue({ SecretId: secretId })
  ).thenReturn({
    promise: () => Promise.resolve({ SecretString: secretValue })
  })

  const data = await provider.get(secretId)
  t.is(data, secretValue)
})

test('get: throws error if no data for secret', async (t) => {
  const secretsManagerClient = td.object(['getSecretValue'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'

  td.when(
    secretsManagerClient.getSecretValue({ SecretId: secretId })
  ).thenReturn({
    promise: () => Promise.resolve(null)
  })

  await t.throwsAsync(() => provider.get(secretId), { message: /no data/i })
})

test('get: throws error if no value for secret', async (t) => {
  const secretsManagerClient = td.object(['getSecretValue'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'

  td.when(
    secretsManagerClient.getSecretValue({ SecretId: secretId })
  ).thenReturn({
    promise: () => Promise.resolve({ SecretString: null })
  })

  await t.throwsAsync(() => provider.get(secretId), { message: /no value/i })
})

test('get: throws error from client', async (t) => {
  const secretsManagerClient = td.object(['getSecretValue'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'
  const err = new Error('Some AWS issue')

  td.when(
    secretsManagerClient.getSecretValue({ SecretId: secretId })
  ).thenReturn({
    promise: () => Promise.reject(err)
  })

  await t.throwsAsync(() => provider.get(secretId), { is: err })
})
