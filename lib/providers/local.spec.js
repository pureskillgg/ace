import test from 'ava'
import * as td from 'testdouble'

import { LocalProvider } from './local.js'

test('get: validates parameterName', async (t) => {
  const localParameters = td.object()
  const provider = new LocalProvider({ localParameters })
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

test('get: returns parameter value if found', async (t) => {
  const parameterName = 'parameter-name'
  const parameterValue = 'parameter-value'
  const localParameters = { [parameterName]: parameterValue }
  const provider = new LocalProvider({ localParameters })
  const data = await provider.get(parameterName)
  t.is(data, parameterValue)
})

test('get: returns undefined if value not found', async (t) => {
  const parameterName = 'parameter-name'
  const localParameters = {}
  const provider = new LocalProvider({ localParameters })
  const data = await provider.get(parameterName)
  t.is(data, undefined)
})
