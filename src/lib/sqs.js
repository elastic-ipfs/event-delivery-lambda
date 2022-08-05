/**
 * Create a single SQS event Record
 * @param {string} body - body of record
 */
function createSqsRecord(body) {
  const messageId = createMessageId()
  return {
    body: body,
    messageId
  }
}

/**
 * Create an SQS Event record that was created by the queue listening on an SNS topic.
 * @param {string} snsMessage - the SNS Notification item Message
 */
function createSqsRecordFromSnsMessage(snsMessage) {
  return createSqsRecord(JSON.stringify({
    Type: 'Notification',
    Message: snsMessage
  }))
}

/**
 * Create an SQS Event from an ipfsEvent (as if the SQS queue pulled it from an SNS topic)
 * @param {object} ipfsEvent - an elastic-ipfs/event object
 */
function createSqsRecordFromSnsIpfsEvent(ipfsEvent) {
  return createSqsRecordFromSnsMessage(JSON.stringify(ipfsEvent))
}

function createSqsEvent(...records) {
  return {
    Records: records
  }
}

function createMessageId() {
  return Math.random().toString().slice(2)
}

module.exports = {
  createSqsEvent,
  createSqsRecord,
  createSqsRecordFromSnsIpfsEvent
}
