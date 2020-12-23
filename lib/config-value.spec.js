import test from 'ava'
import * as td from 'testdouble'

import { ConfigValue } from './config-value.js'

test('constructor: validates args', async (t) => {
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, args: undefined }),
    { message: /args/i },
    'undefined'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, args: null }),
    { message: /args/i },
    'null'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, args: [] }),
    { message: /args/i },
    'empty array'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, args: {} }),
    { message: /args/i },
    'non-array'
  )
})

test('constructor: validates Provider', async (t) => {
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, Provider: undefined }),
    { message: /Provider/i },
    'undefined'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, Provider: null }),
    { message: /Provider/i },
    'null'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, Provider: 22 }),
    { message: /Provider/i },
    'non-constructor'
  )
})

test('get: returns value from provider', async (t) => {
  const args = ['arg1', 'arg2']
  const value = 'some-value'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(...args)).thenResolve(value)

  const configValue = new ConfigValue({ args, Provider })
  const data = await configValue.get()
  t.is(data, value)
})

test('get: passes argument to Provider ', async (t) => {
  const Provider = td.constructor(['get'])
  const provider = td.object(['get'])

  const providerDependencies = { someClient: 'foo' }

  td.when(provider.get(td.matchers.anything())).thenResolve('value')
  td.when(new Provider(providerDependencies)).thenReturn(provider)

  const configValue = new ConfigValue({ args: ['arg1'], Provider })

  const data = await configValue.get(providerDependencies)
  t.truthy(data)
})

test('get: throws provider error', async (t) => {
  const args = ['arg1', 'arg2']
  const err = new Error('Some provider error')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(...args)).thenReject(err)

  const configValue = new ConfigValue({ args, Provider })
  await t.throwsAsync(() => configValue.get())
})

const validConstructorArgs = {
  args: ['some-arg'],
  Provider: Object
}
