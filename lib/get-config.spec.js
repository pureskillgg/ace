import test from 'ava'

import { getConfig } from './get-config.js'

test('retuns config', async (t) => {
  const data = await getConfig()
  t.truthy(data)
})
