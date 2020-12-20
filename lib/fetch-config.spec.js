import test from 'ava'

import { fetchConfig } from './fetch-config.js'

test('retuns config', async (t) => {
  const data = await fetchConfig()
  t.truthy(data)
})
