import test from 'ava'
import * as td from 'testdouble'

import { SecretsManagerProvider } from './secrets-manager.js'

test('constructor: validates secretsManagerClient', async (t) => {
  await t.throws(
    () => new SecretsManagerProvider({ secretsManagerClient: null }),
    { message: /secretsManagerClient/i },
    'null'
  )
  await t.throws(
    () => new SecretsManagerProvider(),
    { message: /secretsManagerClient/i },
    'undefined'
  )
})

test('get: validates parameterName', async (t) => {
  const secretsManagerClient = td.object()
  const provider = new SecretsManagerProvider({ secretsManagerClient })
  await t.throwsAsync(() => provider.get(null), { message: /invalid/i }, 'null')
  await t.throwsAsync(
    () => provider.get(undefined),
    { message: /invalid/i },
    'undefined'
  )
  await t.throwsAsync(
    () => provider.get(''),
    { message: /invalid/i },
    'empty string'
  )
  await t.throwsAsync(
    () => provider.get(22),
    { message: /invalid/i },
    'non-string'
  )
})

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
