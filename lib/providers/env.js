import { LocalProvider } from './local.js'

export class EnvProvider extends LocalProvider {
  constructor({ env = process.env } = {}) {
    super({ localParameters: env })
  }
}
