import test from 'ava'
import * as td from 'testdouble'

import { EnvProvider } from './env.js'

test('get: validates parameterName', async (t) => {
  const env = td.object()
  const provider = new EnvProvider({ env })
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
  const env = { [parameterName]: parameterValue }
  const provider = new EnvProvider({ env })
  const data = await provider.get(parameterName)
  t.is(data, parameterValue)
})

test('get: returns undefined if value not found', async (t) => {
  const parameterName = 'parameter-name'
  const env = {}
  const provider = new EnvProvider({ env })
  const data = await provider.get(parameterName)
  t.is(data, undefined)
})
