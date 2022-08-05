const t = require('tap')
const { createParameters } = require('../src/lib/parameters')

t.test('can readSecret from AWS', async t => {
  if (!process.env.TEST_AWS) {
    return
  }
  const params = createParameters()
  if (process.env.EVENT_TARGET_CREDENTIALS_SECRET_NAME) {
    const secret = await params.readSecret({ name: process.env.EVENT_TARGET_CREDENTIALS_SECRET_NAME ?? '' })
    t.ok(secret, 'read a truthy secret value')
  }
})
