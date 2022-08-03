/**
 * @fileoverview facade for system parameter store. useful for secrets i/o
 */

const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm')
const { logger: defaultLogger } = require('./logging')

const defaultSend = async (command, logger = defaultLogger) => {
  const ssnClient = new SSMClient()
  let parameter
  try {
    parameter = await ssnClient.send(command)
  } catch (error) {
    logger.debug('(not unusual for missing parameters) error getting parameter using ssnClient', error)
  }
  if (parameter) {
    return parameter
  }
}

/**
 * read a secret
 */
async function readSecret({ name, send = defaultSend, logger = defaultLogger }) {
  logger.debug('readSecret', { name })
  try {
    const getParameterResponse = await send(new GetParameterCommand({
      Name: name,
      WithDecryption: true
    }))
    return getParameterResponse?.Parameter?.Value
  } catch (error) {
    if (error.name === 'ParameterNotFound') {
      return undefined
    }
    throw error
  }
}

module.exports = {
  readSecret
}
