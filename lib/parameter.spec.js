import test from 'ava'
import * as td from 'testdouble'

import {
  Parameter,
  ParameterParsingError,
  ParameterValidationError
} from './parameter.js'

test('constructor: validates key', async (t) => {
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, key: undefined }),
    { message: /key/i },
    'undefined'
  )
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, key: null }),
    { message: /key/i },
    'null'
  )
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, key: [] }),
    { message: /key/i },
    'empty array'
  )
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, key: {} }),
    { message: /key/i },
    'non-array'
  )
})

test('constructor: validates Provider', async (t) => {
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: undefined }),
    { message: /Provider/i },
    'undefined'
  )
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: null }),
    { message: /Provider/i },
    'null'
  )
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: 22 }),
    { message: /Provider/i },
    'non-constructor'
  )
})

test('constructor: validates isSensitive', async (t) => {
  await t.throws(
    () => new Parameter({ ...validConstructorArgs, isSensitive: 0 }),
    { message: /isSensitive/i },
    'non-boolean'
  )
})

test('constructor: sets isSensitive', async (t) => {
  t.false(new Parameter(validConstructorArgs).isSensitive, 'default')
  t.true(
    new Parameter({ ...validConstructorArgs, isSensitive: true }).isSensitive,
    'override'
  )
})

test('get: returns value from provider', async (t) => {
  const key = 'mock-key'
  const value = 'mock-value'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenResolve(value)

  const parameter = new Parameter({ key, Provider })
  parameter.initProvider()
  const data = await parameter.get()
  t.is(data, value)
})

test('get: returns value from provider with override key', async (t) => {
  const key = 'mock-key'
  const value = 'mock-value'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenResolve(value)

  const parameter = new Parameter({ key: 'other-key', Provider })
  parameter.initProvider()
  const data = await parameter.get(key)
  t.is(data, value)
})

test('get: throws provider error', async (t) => {
  const key = 'mock-key'
  const err = new Error('Mock provider error')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReject(err)

  const parameter = new Parameter({ key, Provider })
  parameter.initProvider()
  await t.throwsAsync(() => parameter.get(), { is: err })
})

test('get: throws if provider not initialized', async (t) => {
  const key = 'mock-key'
  const Provider = td.constructor(['get'])
  const parameter = new Parameter({ key, Provider })
  await t.throwsAsync(() => parameter.get(), { message: /initProvider/i })
})

test('get: throws if parameter value does not validate', async (t) => {
  const key = 'mock-key'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({ key, Provider, validator: () => false })
  parameter.initProvider()

  const error = await t.throwsAsync(() => parameter.get(), {
    instanceOf: ParameterValidationError
  })
  t.is(error.key, key)
  t.is(error.data, 'mock-value')
})

test('get: parses parameter', async (t) => {
  const key = 'mock-key'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({
    key,
    Provider,
    parser: (value) => `${value}-2`
  })
  parameter.initProvider()
  const data = await parameter.get(key)
  t.is(data, 'mock-value-2')
})

test('get: throws error on parse error', async (t) => {
  const key = 'mock-key'
  const err = new Error('foo')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({
    key,
    Provider,
    parser: (value) => {
      throw err
    }
  })
  parameter.initProvider()

  const error = await t.throwsAsync(() => parameter.get(), {
    instanceOf: ParameterParsingError
  })
  t.is(error.key, key)
  t.is(error.data, 'mock-value')
  t.is(error.error, err)
})

test('initProvider: passes arguments to Provider', async (t) => {
  const Provider = td.constructor()
  const providerDependencies = { mockClient: 'foo' }
  const parameter = new Parameter({ ...validConstructorArgs, Provider })

  parameter.initProvider(providerDependencies)
  td.verify(new Provider(providerDependencies))
  t.pass()
})

test('providerName: returns provider name', async (t) => {
  const parameter = new Parameter({
    ...validConstructorArgs,
    Provider: MockProvider
  })
  t.is(parameter.providerName, 'MockProvider')
})

test('ParameterValidationError', (t) => {
  const key = 'mock-key'
  const data = 'mock-value'
  const err = new ParameterValidationError(key, data)
  t.like(err, {
    name: 'ParameterValidationError',
    code: 'err_parameter_validate',
    key,
    data
  })
})

test('ParameterParsingError', (t) => {
  const key = 'mock-key'
  const data = 'mock-value'
  const error = new Error('foo')
  const err = new ParameterParsingError(key, data, error)
  t.like(err, {
    name: 'ParameterParsingError',
    code: 'err_parameter_parse',
    key,
    data,
    error
  })
})

class MockProvider {}

const validConstructorArgs = {
  key: 'mock-key',
  Provider: MockProvider
}
