const { Request } = require('@web-std/fetch')
const assert = require('assert')
const { basicAuthHeaderValue } = require('./basic-auth')
const { logger } = require('./logging')

/**
 * @param {(request: Request) => Promise<Response>} fetch
 * @returns {(target: URL, event: unknown) => Promise<void>}
 */
function createWebhookDeliver(fetch) {
  return async (target, event) => {
    // target URL may have user:pass in it. If so, reuse as http basic auth Authorization header value in webhook
    const authorization = (target.username || target.password) ? basicAuthHeaderValue(target.username, target.password) : undefined
    const requestBody = JSON.stringify(event, null, 2)
    const request = new Request(target, {
      method: 'post',
      headers: {
        authorization,
        'content-type': 'application/json'
      },
      body: requestBody
    })
    logger.debug(`delivering event via webhook type=${event.type}`)
    const response = await fetch(request)
    logger.info(`webhook delivery response status=${response.status}`)
    const is2xxResponseCode = ({ status }) => status >= 200 && status < 300
    if (!is2xxResponseCode(response)) {
      const responseText = response.text().catch(error => `Error reading response text: ${error}`)
      logger.info(`webhook-deliver could not deliver event. requestBody=${requestBody} responseText=${await responseText}`)
    }
    // expect 2xx response status
    assert.ok(is2xxResponseCode(response), `expected 2xx response status code, but got ${response.status}`)
  }
}

module.exports = {
  createWebhookDeliver
}
