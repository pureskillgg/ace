import test from 'ava'
import * as td from 'testdouble'

import { LocalProvider } from './local.js'

test('constructor: validates localParameters', async (t) => {
  await t.throws(
    () => new LocalProvider({ localParameters: null }),
    { message: /localParameters/i },
    'null'
  )
  await t.throws(
    () => new LocalProvider(),
    { message: /missing/i },
    'undefined'
  )
})

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

test('get: throws error if no value for parameter', async (t) => {
  const parameterName = 'parameter-name'
  const localParameters = { 'not-parameter-name': 'foo' }
  const provider = new LocalProvider({ localParameters })
  await t.throwsAsync(() => provider.get(parameterName), {
    message: /no value/i
  })
})