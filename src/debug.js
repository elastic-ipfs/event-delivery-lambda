'use strict'

const { resolve } = require('path')
const { readFileSync } = require('fs')

const { handler } = require('./index')

const event = JSON.parse(readFileSync(resolve(process.cwd(), process.argv[2] ?? 'test/sqs-events/batch-size-1.json'), 'utf-8'));
(async () => {
  const result = await handler(event)
  if (result) {
    console.log(result)
  }
})()
