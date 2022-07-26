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
    const request = new Request(target, {
      method: 'post',
      headers: {
        authorization,
        'content-type': 'application/json'
      },
      body: JSON.stringify(event, null, 2)
    })
    logger.debug(`delivering event via webhook type=${event.type}`)
    const response = await fetch(request)
    logger.debug(`webhook delivery response status=${response.status}`)
    // expect 2xx response status
    assert.ok(response.status >= 200 && response.status < 300)
  }
}

module.exports = {
  createWebhookDeliver
}
