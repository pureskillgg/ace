import test from 'ava'
import * as td from 'testdouble'

import {
  Parameter,
  ParameterParsingError,
  ParameterValidationError
} from './parameter.js'

test('constructor: validates name', (t) => {
  t.throws(
    () => new Parameter({ ...validConstructorArgs, name: undefined }),
    { message: /name/i },
    'undefined'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, name: null }),
    { message: /name/i },
    'null'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, name: [] }),
    { message: /name/i },
    'empty array'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, name: {} }),
    { message: /name/i },
    'non-array'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, name: '' }),
    { message: /name/i },
    'empty string'
  )
})

test('constructor: validates alias', (t) => {
  t.truthy(
    new Parameter({ ...validConstructorArgs, alias: undefined }),
    'undefined'
  )
  t.truthy(new Parameter({ ...validConstructorArgs, alias: null }), 'null')
  t.throws(
    () => new Parameter({ ...validConstructorArgs, alias: [] }),
    { message: /alias/i },
    'empty array'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, alias: {} }),
    { message: /alias/i },
    'non-array'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, alias: '' }),
    { message: /alias/i },
    'empty string'
  )
})

test('constructor: sets properties', (t) => {
  const parameters = {
    isSensitive: true,
    alias: 'foo',
    name: 'bar'
  }
  const parameter = new Parameter({ ...validConstructorArgs, ...parameters })
  t.like(parameter, parameters)
})

test('constructor: validates Provider', (t) => {
  t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: undefined }),
    { message: /Provider/i },
    'undefined'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: null }),
    { message: /Provider/i },
    'null'
  )
  t.throws(
    () => new Parameter({ ...validConstructorArgs, Provider: 22 }),
    { message: /Provider/i },
    'non-constructor'
  )
})

test('constructor: validates isSensitive', (t) => {
  t.throws(
    () => new Parameter({ ...validConstructorArgs, isSensitive: 0 }),
    { message: /isSensitive/i },
    'non-boolean'
  )
})

test('constructor: sets isSensitive', (t) => {
  t.false(new Parameter(validConstructorArgs).isSensitive, 'default')
  t.true(
    new Parameter({ ...validConstructorArgs, isSensitive: true }).isSensitive,
    'override'
  )
})

test('get: returns value from provider', async (t) => {
  const value = 'mock-value'

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenResolve(value)

  const parameter = new Parameter({ name, Provider })
  parameter.initProvider()
  const data = await parameter.get(key)
  t.is(data, value)
})

test('get: throws provider error', async (t) => {
  const err = new Error('Mock provider error')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReject(err)

  const parameter = new Parameter({ name, Provider })
  parameter.initProvider()
  await t.throwsAsync(() => parameter.get(key), { is: err })
})

test('get: validates key', async (t) => {
  const Provider = td.constructor(['get'])
  const parameter = new Parameter({ name, Provider })
  parameter.initProvider()
  await t.throwsAsync(() => parameter.get(), { message: /key/i })
})

test('get: throws if provider not initialized', async (t) => {
  const Provider = td.constructor(['get'])
  const parameter = new Parameter({ name, Provider })
  await t.throwsAsync(() => parameter.get(key), { message: /initProvider/i })
})

test('get: throws if parameter value does not validate', async (t) => {
  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({ name, Provider, validator: () => false })
  parameter.initProvider()

  const error = await t.throwsAsync(() => parameter.get(key), {
    instanceOf: ParameterValidationError
  })
  t.is(error.key, key)
  t.is(error.data, 'mock-value')
})

test('get: parses parameter', async (t) => {
  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({
    name,
    Provider,
    parser: (value) => `${value}-2`
  })
  parameter.initProvider()
  const data = await parameter.get(key)
  t.is(data, 'mock-value-2')
})

test('get: throws error on parse error', async (t) => {
  const err = new Error('foo')

  const Provider = td.constructor(['get'])

  td.when(Provider.prototype.get(key)).thenReturn('mock-value')

  const parameter = new Parameter({
    name,
    Provider,
    parser: (value) => {
      throw err
    }
  })
  parameter.initProvider()

  const error = await t.throwsAsync(() => parameter.get(key), {
    instanceOf: ParameterParsingError
  })
  t.is(error.key, key)
  t.is(error.data, 'mock-value')
  t.is(error.error, err)
})

test('initProvider: passes arguments to Provider', (t) => {
  const Provider = td.constructor()
  const providerDependencies = { mockClient: 'foo' }
  const parameter = new Parameter({ ...validConstructorArgs, Provider })

  parameter.initProvider(providerDependencies)
  td.verify(new Provider(providerDependencies))
  t.pass()
})

test('providerName: returns provider name', (t) => {
  const parameter = new Parameter({
    ...validConstructorArgs,
    Provider: MockProvider
  })
  t.is(parameter.providerName, 'MockProvider')
})

test('ParameterValidationError', (t) => {
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

const key = 'mock-key'
const name = 'mock-name'

const validConstructorArgs = {
  name,
  Provider: MockProvider
}
