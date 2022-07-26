'use strict'

const { resolve } = require('path')
const { readFileSync } = require('fs')

const { handler } = require('./index')

const event = JSON.parse(readFileSync(resolve(process.cwd(), process.argv[2] ?? 'event.json'), 'utf-8'))
handler(event)
