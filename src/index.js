'use strict'

const { createEventDeliveryLambda } = require('./lib/event-delivery-lambda')
const { logger } = require('./lib/logging')
const { createWebhookDeliver } = require('./lib/webhook-deliver')
const config = require('./config')
const fetch = require('@web-std/fetch')

/**
 * Returns an empty object on success
 * @param {Event} event
 */
async function main(event) {
  logger.debug('handling event')
  const { eventTarget } = await config.envToEventTargetConfig(process.env)
  const handle = createEventDeliveryLambda(
    eventTarget,
    createWebhookDeliver(fetch)
  )
  const result = await handle(event)
  return result
}

exports.handler = main
