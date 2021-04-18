import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'

import { getConfig, localString } from '../index.js'

test('retuns empty config', async (t) => {
  const data = await getConfig()
  t.deepEqual(data, {})
})

test('retuns config', async (t) => {
  const localParameters = { alpha: 'one', beta: 'two' }
  const data = await getConfig({
    parameters: {
      foo: localString('FOO'),
      bar: localString('BAR')
    },
    aliases: { FOO: 'alpha', BAR: 'beta' },
    localParameters,
    log: createLogger({ t })
  })
  t.deepEqual(data, { foo: 'one', bar: 'two' })
})

test('throws error if missing alias', async (t) => {
  const localParameters = { alpha: 'one', beta: 'two' }
  await t.throwsAsync(
    () =>
      getConfig({
        parameters: {
          foo: localString('FOO'),
          bar: localString('BAR')
        },
        aliases: { FOO: 'alpha', NOTBAR: 'beta' },
        localParameters,
        log: createLogger({ t })
      }),
    { message: /alias/i }
  )
})

test('uses key directly if aliases is null', async (t) => {
  const localParameters = { FOO: 'one', BAR: 'two' }
  const data = await getConfig({
    parameters: {
      foo: localString('FOO'),
      bar: localString('BAR')
    },
    aliases: null,
    localParameters,
    log: createLogger({ t })
  })
  t.deepEqual(data, { foo: 'one', bar: 'two' })
})
