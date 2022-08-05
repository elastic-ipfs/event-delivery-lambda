const t = require('tap')
const { envToEventTargetConfig } = require('../src/config')

t.test('envToEventTargetConfig uses auth from EVENT_TARGET_CREDENTIALS_SECRET_NAME', async t => {
  const secretsMap = new Map(Object.entries({
    superSecretKey: 'https://userA:passwordA@secret-metrics-collector.com'
  }))
  const env = {
    EVENT_TARGET: 'https://env-event-target.com',
    EVENT_TARGET_CREDENTIALS_SECRET_NAME: 'superSecretKey'
  }
  const parameters = {
    readSecret(secret) {
      return secretsMap.get(secret.name)
    }
  }
  const etConfig = await envToEventTargetConfig(env, undefined, undefined, undefined, parameters)
  t.equal(etConfig.eventTarget.username, 'userA')
  t.equal(etConfig.eventTarget.password, 'passwordA')
})
