import { getConfig, localString } from '../index.js'

export const getLocalConfig = ({ log }) => async (key) => {
  const config = await getConfig({
    parameters: {
      foo: localString('FOO'),
      bar: localString('BAR')
    },
    aliases: { FOO: 'alpha', BAR: 'beta' },
    localParameters,
    log
  })
  if (key) return config[key]
  return config
}

const localParameters = { alpha: 'one', beta: 'two' }
