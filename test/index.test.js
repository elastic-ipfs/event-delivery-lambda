'use strict'

const t = require('tap')
const { createEventDeliveryLambda } = require('../src/lib/event-delivery-lambda')
const { createSqsRecordFromSnsIpfsEvent, createSqsEvent } = require('../src/lib/sqs')
const fs = require('fs/promises')
const path = require('path')
const { Response } = require('@web-std/fetch')
const { createWebhookDeliver } = require('../src/lib/webhook-deliver')
const { basicAuthentication } = require('../src/lib/basic-auth')
const { Console } = require('console')
const { Writable } = require('stream')

const createSilentConsole = () => new Console(new Writable())

async function createExampleEvent(eventType) {
  const eventFilePath = path.join(__dirname, './indexer-events', `${eventType}.json`)
  const eventString = await fs.readFile(eventFilePath, 'utf-8')
  const event = JSON.parse(eventString)
  return event
}

t.test('event-delivery-lambda handles sqsEvent and calls deliver', async t => {
  const eventType = 'IndexerCompleted'
  const fakeEventTarget = new URL('http://userA:passwordA@example.com')
  const deliveries = []
  const deliver = async (target, event) => {
    deliveries.push({ event, target })
  }
  const handle = createEventDeliveryLambda(fakeEventTarget, deliver, createSilentConsole())
  const event = createSqsEvent(createSqsRecordFromSnsIpfsEvent(await createExampleEvent(eventType)))
  await handle(event)
  t.equal(deliveries.length, 1)
  t.equal(deliveries[0].event.type, eventType)
})

t.test('event-delivery-lambda handles multi-Record sqsEvent and returns batchItemFailures', async t => {
  /**
   * sqsEvents can have more than one 'Record', i.e. queue items.
   * We want to to ensure that we can process multi-record sqsEvents. If one record fails to process, its messageId should show up in batchItemFailures
   * https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
   * For this test, there will be three records.
   * Only the first `deliver` will succeed, and subsequent ones will throw.
   * We'll expect the latter two to show up in batchItemFailures
   */
  const eventType = 'IndexerCompleted'
  const fakeEventTarget = new URL('http://userA:passwordA@example.com')
  const desiredSuccessful = 1
  const desiredUnsuccessful = 3
  let successfulDeliveriesRemaining = desiredSuccessful
  const eventsDelivered = []
  const deliver = async (target, event) => {
    if (successfulDeliveriesRemaining <= 0) {
      throw new Error('cannot deliver')
    }
    eventsDelivered.push(event)
    successfulDeliveriesRemaining--
  }
  // so expected errors dont make test output ugly
  const silentConsole = new Console(new Writable())
  const handle = createEventDeliveryLambda(fakeEventTarget, deliver, silentConsole)
  const sampleEvent = await createExampleEvent(eventType)
  const records = (new Array(desiredSuccessful + desiredUnsuccessful).fill(0)).map(i => createSqsRecordFromSnsIpfsEvent(sampleEvent))
  const expectedFailureMessageIds = records.slice(desiredSuccessful).map(e => e.messageId)
  const event = createSqsEvent(...records)
  const result = await handle(event)
  t.equal(eventsDelivered.length, desiredSuccessful)
  t.equal(eventsDelivered[0].type, eventType)
  t.equal(result.batchItemFailures.length, desiredUnsuccessful)
  const actualFailureMessageIds = new Set(result.batchItemFailures.map(f => f.itemIdentifier))
  for (const mid of expectedFailureMessageIds) {
    t.equal(actualFailureMessageIds.has(mid), true)
  }
})

function createFakeDeliver() {
  const deliveries = []
  const deliver = (target, event) => {
    deliveries.push(event)
  }
  return { deliver, deliveries }
}

t.test('can process example sqs-events', async t => {
  const fakeEventTarget = new URL('http://userA:passwordA@example.com')
  const eventsDir = path.join(__dirname, 'sqs-events')
  const exampleEvents = (await fs.readdir(eventsDir)).map(file => path.join(eventsDir, file))
  for (const eventFile of exampleEvents) {
    const { deliveries, deliver } = createFakeDeliver()
    const eventString = await fs.readFile(eventFile, 'utf-8')
    const event = JSON.parse(eventString)
    const handle = createEventDeliveryLambda(fakeEventTarget, deliver)
    await handle(event)
    for (const delivery of deliveries) {
      t.ok(delivery.type, 'expect delivered event to have a type')
    }
    t.ok(deliveries.length >= 1)
  }
})

t.test('FetchDeliverer delivers events as HTTP POST', async t => {
  const fetchedRequests = []
  const fakeFetch = async (request) => {
    fetchedRequests.push(request)
    return new Response('ok', { status: 202 })
  }
  const deliver = createWebhookDeliver(fakeFetch)
  const eventTargetAuth = { user: 'userA', password: 'passwordA' }
  const eventTarget = new URL(`http://${eventTargetAuth.user}:${eventTargetAuth.password}@example.com`)
  const exampleIpfsEvent = await createExampleEvent('IndexerCompleted')
  await deliver(eventTarget, exampleIpfsEvent)
  t.equal(fetchedRequests.length, 1)
  for (const request of fetchedRequests) {
    t.equal(request.method, 'POST', 'expect webhook request method to be POST')
    const authorizationHeader = request.headers.get('authorization')
    t.ok(authorizationHeader, 'expect webhook request to have authorization header')
    const parsedAuthorization = basicAuthentication(authorizationHeader)
    t.equal(parsedAuthorization.user, eventTargetAuth.user)
    t.equal(parsedAuthorization.password, eventTargetAuth.password)
    const requestBody = await readToString(request.body)
    const parsedBody = JSON.parse(requestBody)
    t.equal(parsedBody.type, exampleIpfsEvent.type, 'expect webhook request body to be the delivered ipfsEvent')
  }
  // if fetch results in a non-2xx status, it should throw
  const erroringFetch = async (request) => {
    return new Response('fakeresponse', { status: 400 })
  }
  const erroringDeliver = createWebhookDeliver(erroringFetch)
  try {
    await erroringDeliver(eventTarget, exampleIpfsEvent)
    t.fail('erroringDeliver should have failed')
  } catch (error) {
    if (error.name !== 'AssertionError') {
      // unexpected error
      throw error
    } else {
      // we expect this error
    }
  }
})

/**
 * Read an entire ReadableStream and return the contents decoded to a string
 * @param {ReadableStream} stream - stream to read from
 * @returns {Promise<string>} entire contents of stream
 */
async function readToString(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(new TextDecoder().decode(chunk))
  }
  return chunks.join('')
}
