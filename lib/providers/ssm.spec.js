import test from 'ava'
import * as td from 'testdouble'

import { SsmProvider } from './ssm.js'

test('get: returns parameter value if found', async (t) => {
  const ssmClient = td.object(['getParameter'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'
  const parameterValue = 'parameter-value'

  td.when(ssmClient.getParameter({ Name: parameterName })).thenReturn({
    promise: () => Promise.resolve({ Parameter: { Value: parameterValue } })
  })

  const data = await provider.get(parameterName)
  t.is(data, parameterValue)
})

test('get: throws error if no data for parameter', async (t) => {
  const ssmClient = td.object(['getParameter'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'

  td.when(ssmClient.getParameter({ Name: parameterName })).thenReturn({
    promise: () => Promise.resolve(null)
  })

  await t.throwsAsync(() => provider.get(parameterName), {
    message: /no data/i
  })
})

test('get: throws error if no value for parameter', async (t) => {
  const ssmClient = td.object(['getParameter'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'

  td.when(ssmClient.getParameter({ Name: parameterName })).thenReturn({
    promise: () => Promise.resolve({ Parameter: { Value: null } })
  })

  await t.throwsAsync(() => provider.get(parameterName), {
    message: /no value/i
  })
})

test('get: throws error from client', async (t) => {
  const ssmClient = td.object(['getParameter'])
  const provider = new SsmProvider({ ssmClient })

  const parameterName = 'parameter-name'
  const err = new Error('Some AWS issue')

  td.when(ssmClient.getParameter({ Name: parameterName })).thenReturn({
    promise: () => Promise.reject(err)
  })

  await t.throwsAsync(provider.get(parameterName), { is: err })
})
