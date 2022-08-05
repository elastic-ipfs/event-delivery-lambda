/**
 * @fileoverview facade for system parameter store. useful for secrets i/o
 */

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm')
const { logger: defaultLogger } = require('./logging')

/**
 * create an object that reads parameters via aws SSNClient
 * @param {*} param0
 * @returns
 */
function createParameters({
  region = 'us-west-2',
  ssmClient = new SSMClient({ region })
} = {}) {
  /** read a secret parameter */
  async function readSecret({
    name,
    logger = defaultLogger
  }) {
    if (typeof name !== 'string') {
      throw new Error(`unexpected non-string type for name: ${typeof name}`)
    }
    console.debug('readSecret', { name })
    try {
      const getParametersResponse = await ssmClient.send(
        new GetParametersCommand({
          Names: [name],
          WithDecryption: true
        })
      )
      return getParametersResponse?.Parameters?.[0]?.Value
    } catch (error) {
      if (error.name === 'ParameterNotFound') {
        logger.info(`ParameterNotFound name=${name}`)
        return undefined
      }
      throw error
    }
  }
  return {
    readSecret
  }
}

module.exports = {
  createParameters
}
