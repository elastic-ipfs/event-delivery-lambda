'use strict'

const { resolve } = require('path')
/* c8 ignore next */
require('dotenv').config({ path: process.env.ENV_FILE_PATH || resolve(process.cwd(), '.env') })

const defaultParameters = require('./lib/parameters')
const defaultEnv = process.env

/**
 * Object with functions that can extract config values from env like process.env
 */
class EnvToConfig {
  static eventTarget(env) {
    const envVar = env.EVENT_TARGET
    if (envVar) { return new URL(envVar) }
  }

  static eventTargetCredentialsSecretName(env) {
    return env.EVENT_TARGET_CREDENTIALS_SECRET_NAME
  }
}

/**
 * Read an env and return configuration values
 * @returns {Promise<{
 *   eventTarget: URL
 *   eventTargetCredentialsSecretName: string | undefined
 * }>}
 */
const envToEventTargetConfig = async (
  env = defaultEnv,
  eventTarget = EnvToConfig.eventTarget(env),
  eventTargetCredentialsSecretName = EnvToConfig.eventTargetCredentialsSecretName(env),
  parameters = defaultParameters
) => {
  // if eventTargetCredentialsSecretName is set, it takes priority to determine final eventTarget string
  if (eventTargetCredentialsSecretName) {
    const eventTargetString = await parameters.readSecret({ name: eventTargetCredentialsSecretName })
    if (eventTargetString) {
      eventTarget = new URL(eventTargetString)
    }
  }
  return {
    eventTarget,
    eventTargetCredentialsSecretName
  }
}

const {
  CONCURRENCY: rawConcurrency
} = process.env

const concurrency = parseInt(rawConcurrency)

module.exports = {
  concurrency: !isNaN(concurrency) && concurrency > 0 ? concurrency : 32,
  envToEventTargetConfig,
  EnvToConfig
}
