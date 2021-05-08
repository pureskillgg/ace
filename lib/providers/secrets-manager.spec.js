import test from 'ava'
import * as td from 'testdouble'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

import { registerTestdoubleMatchers } from '../../testdouble-matchers.js'
import { SecretsManagerProvider } from './secrets-manager.js'

test.before(() => {
  registerTestdoubleMatchers(td)
})

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

test('get: returns secret value if found', async (t) => {
  const secretsManagerClient = td.object(['send'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'
  const secretValue = 'secret-value'

  td.when(
    secretsManagerClient.send(
      td.matchers.isAwsSdkCommand(
        new GetSecretValueCommand({
          SecretId: secretId
        })
      )
    )
  ).thenResolve({ SecretString: secretValue })

  const data = await provider.get(secretId)
  t.is(data, secretValue)
})

test('get: returns fallback if no data for secret', async (t) => {
  const secretsManagerClient = td.object(['send'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })
  const secretId = 'secret-id'
  td.when(secretsManagerClient.send(td.matchers.anything())).thenResolve(null)
  const data = await provider.get(secretId, 'mock-fallback')
  t.is(data, 'mock-fallback')
})

test('get: returns fallback if no value for secret', async (t) => {
  const secretsManagerClient = td.object(['send'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })
  const secretId = 'secret-id'
  td.when(secretsManagerClient.send(td.matchers.anything())).thenResolve({
    SecretString: null
  })
  const data = await provider.get(secretId, 'mock-fallback')
  t.is(data, 'mock-fallback')
})

test('get: throws error from client', async (t) => {
  const secretsManagerClient = td.object(['send'])
  const provider = new SecretsManagerProvider({ secretsManagerClient })

  const secretId = 'secret-id'
  const err = new Error('Mock AWS issue')

  td.when(secretsManagerClient.send(td.matchers.anything())).thenReject(err)

  await t.throwsAsync(() => provider.get(secretId), { is: err })
})
