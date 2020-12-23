import path from 'path'

import examplr from '@meltwater/examplr'

import { getLocalConfig } from './get.js'

const { createExamples } = examplr

const examples = {
  getLocalConfig
}

const envVars = ['LOG_LEVEL', 'LOG_FILTER', 'LOG_OUTPUT_MODE']

const defaultOptions = {}

const { runExample } = createExamples({
  examples,
  envVars,
  defaultOptions
})

runExample({
  local: path.resolve('examples', 'local.json')
})
