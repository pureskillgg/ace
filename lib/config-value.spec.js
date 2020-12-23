import test from 'ava'
import * as td from 'testdouble'

import { ConfigValue } from './config-value.js'

test('constructor: validates key', async (t) => {
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, key: undefined }),
    { message: /key/i },
    'undefined'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, key: null }),
    { message: /key/i },
    'null'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, key: [] }),
    { message: /key/i },
    'empty array'
  )
  await t.throws(
    () => new ConfigValue({ ...validConstructorArgs, key: {} }),
    { message: /key/i },
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
  const key = 'some-key'
  const value = 'some-value'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenResolve(value)

  const configValue = new ConfigValue({ key, Provider })
  configValue.initProvider()
  const data = await configValue.get()
  t.is(data, value)
})

test('get: throws provider error', async (t) => {
  const key = 'some-key'
  const err = new Error('Some provider error')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReject(err)

  const configValue = new ConfigValue({ key, Provider })
  configValue.initProvider()
  await t.throwsAsync(() => configValue.get(), { is: err })
})

test('get: throws if provider not initialized', async (t) => {
  const key = 'some-key'
  const err = new Error('Some provider error')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReject(err)

  const configValue = new ConfigValue({ key, Provider })
  await t.throwsAsync(() => configValue.get(), { message: /initProvider/i })
})

test('initProvider: passes arguments to Provider', async (t) => {
  const Provider = td.constructor()
  const provider = td.object()

  const providerDependencies = { someClient: 'foo' }

  td.when(new Provider(providerDependencies)).thenReturn(provider)

  const configValue = new ConfigValue({ ...validConstructorArgs, Provider })

  configValue.initProvider(providerDependencies)
  t.is(configValue.provider, provider)
})

test('initProvider: throws if provider already initialized', async (t) => {
  const Provider = td.constructor()
  const provider = td.object()

  const providerDependencies = {}

  td.when(new Provider(providerDependencies)).thenReturn(provider)

  const configValue = new ConfigValue({ ...validConstructorArgs, Provider })

  configValue.initProvider(providerDependencies)
  t.throws(() => configValue.initProvider(providerDependencies), {
    message: /initialized/i
  })
})

test('getProviderName: returns provider name', async (t) => {
  const configValue = new ConfigValue({
    ...validConstructorArgs,
    Provider: MockProvider
  })
  t.is(configValue.getProviderName(), 'MockProvider')
})

class MockProvider {}

const validConstructorArgs = {
  key: 'some-key',
  Provider: MockProvider
}
