import test from 'ava'
import * as td from 'testdouble'
import { GetParameterCommand } from '@aws-sdk/client-ssm'

import { registerTestdoubleMatchers } from '../../testdouble-matchers.js'
import { SsmProvider } from './ssm.js'

test.before(() => {
  registerTestdoubleMatchers(td)
})

test('constructor: validates ssmClient', async (t) => {
  await t.throws(
    () => new SsmProvider({ ssmClient: null }),
    { message: /ssmClient/i },
    'null'
  )
  await t.throws(() => new SsmProvider(), { message: /missing/i }, 'undefined')
})

test('get: returns parameter value if found', async (t) => {
  const ssmClient = td.object(['send'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'
  const parameterValue = 'parameter-value'

  td.when(
    ssmClient.send(
      td.matchers.isAwsSdkCommand(
        new GetParameterCommand({
          Name: parameterName
        })
      )
    )
  ).thenResolve({ Parameter: { Value: parameterValue } })

  const data = await provider.get(parameterName)
  t.is(data, parameterValue)
})

test('get: returns undefined if no data for parameter', async (t) => {
  const ssmClient = td.object(['send'])
  const provider = new SsmProvider({ ssmClient })
  const parameterName = 'parameter-name'
  td.when(ssmClient.send(td.matchers.anything())).thenResolve(null)
  const data = await provider.get(parameterName)
  t.is(data, undefined)
})

test('get: returns undefined if parameter not found', async (t) => {
  const ssmClient = td.object(['send'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'
  const err = new Error('Not found')
  err.name = 'ParameterNotFound'

  td.when(ssmClient.send(td.matchers.anything())).thenReject(err)

  const data = await provider.get(parameterName)
  t.is(data, undefined)
})

test('get: throws error from client', async (t) => {
  const ssmClient = td.object(['send'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'
  const err = new Error('Mock AWS issue')

  td.when(ssmClient.send(td.matchers.anything())).thenReject(err)

  await t.throwsAsync(provider.get(parameterName), { is: err })
})
