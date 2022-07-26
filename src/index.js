'use strict'

const { logger } = require('./lib/logging')

/**
 * Event to invoke the lambda
 * @typedef {Object} Event
 * @property {Array<Record>} Records
 */

/**
 * @typedef {Object} Record
 * @property {String} body
 */

function parseEvent(event) {
  if (event.Records.length !== 1) {
    logger.error(`Indexer Lambda invoked with ${event.Records.length} CARs while should be 1`)
    throw new Error(`Indexer Lambda invoked with ${event.Records.length} CARs while should be 1`)
  }

  const body = event.Records[0].body
  try {
    return JSON.parse(body)
  } catch {
    throw new Error('Invalid JSON in event body: ' + body)
  }
}

/**
 * Returns an empty object on success
 * @param {Event} event
 */
async function main(eventRaw) {
  const event = parseEvent(eventRaw)
  logger.debug('handling event', event)
}

exports.handler = main
