function createSqsRecord(body) {
  const messageId = createMessageId()
  return {
    body: JSON.stringify(body),
    messageId
  }
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
  createSqsRecord
}
