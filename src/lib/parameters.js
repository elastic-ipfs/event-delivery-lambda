/**
 * @fileoverview facade for system parameter store. useful for secrets i/o
 */

const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm')
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
    logger.debug('readSecret', { name })
    try {
      const getParameterResponse = await ssmClient.send(
        new GetParameterCommand({
          Name: name,
          WithDecryption: true
        })
      )
      return getParameterResponse?.Parameter?.Value
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
