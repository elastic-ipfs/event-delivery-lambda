'use strict'

const { resolve } = require('path')

/* c8 ignore next */
require('dotenv').config({ path: process.env.ENV_FILE_PATH || resolve(process.cwd(), '.env') })

const {
  CONCURRENCY: rawConcurrency
} = process.env

const concurrency = parseInt(rawConcurrency)

module.exports = {
  concurrency: !isNaN(concurrency) && concurrency > 0 ? concurrency : 32
}
