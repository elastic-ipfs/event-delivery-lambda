/**
 * @typedef SqsEventRecord
 * @property {string} messageId
 * @property {string} body
 */

/**
 * @typedef SqsEvent
 * @property {[SqsEventRecord]} Records
 */

/**
 * @typedef IpfsEvent
 * @property {string} type
 */

const maskPassword = (url, newPassword = '*') => {
  const tempUrl = new URL(url)
  tempUrl.password = newPassword
  return tempUrl
}

/**
 * @param {URL} eventTarget
 * @param {(target: URL, event: IpfsEvent) => Promise<void>} deliver
 */
function createEventDeliveryLambda(eventTarget, deliver, console = globalThis.console) {
  /**
   * @param {SqsEventRecord} record
   */
  async function processRecord(record) {
    const ipfsEvent = JSON.parse(record.body)
    await deliver(eventTarget, ipfsEvent)
  }
  /**
   * @param {SqsEvent} sqsEvent
   */
  return async sqsEvent => {
    console.log('event-delivery-lambda start', { eventTarget: maskPassword(eventTarget).toString() })
    const batchItemFailures = []
    await Promise.allSettled(sqsEvent.Records.map(async record => {
      try {
        await processRecord(record)
      } catch (error) {
        console.error('error processing record', error)
        batchItemFailures.push({
          itemIdentifier: record.messageId
        })
      }
    }))
    return { batchItemFailures }
  }
}

module.exports = {
  createEventDeliveryLambda
}
