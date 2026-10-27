import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { validateMessage } from '../src/validation.js'

const valid = {
  name: 'Alex',
  email: 'alex@example.com',
  message: 'Hello, I have an idea to share.',
}

test('validation trims fields and only accepts the allowed keys', () => {
  assert.deepEqual(
    validateMessage({
      ...valid,
      name: ' Alex ',
      email: 'ALEX@example.com',
      admin: true,
    }).data,
    valid,
  )
})
test('rejects malformed, empty, oversized, or invalid input', () => {
  for (const body of [
    null,
    [],
    {},
    { ...valid, name: ' ' },
    { ...valid, email: 'not-an-email' },
    { ...valid, message: 'short' },
    { ...valid, name: 'a'.repeat(101) },
    { ...valid, message: 'a'.repeat(5001) },
    { ...valid, email: { $gt: '' } },
  ])
    assert.ok(validateMessage(body).error)
})
async function withServer(options, run) {
  const server = createApp(options).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}
const send = (url, body) =>
  fetch(`${url}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

test('POST stores a valid message without exposing the saved data', async () => {
  let saved
  await withServer(
    {
      isReady: () => true,
      saveMessage: async (data) => {
        saved = data
      },
    },
    async (url) => {
      const response = await send(url, valid)
      assert.equal(response.status, 201)
      assert.deepEqual(saved, valid)
      assert.deepEqual(await response.json(), {
        message: 'Your message has been saved.',
      })
    },
  )
})
test('invalid input is rejected and messages cannot be publicly listed', async () => {
  await withServer({}, async (url) => {
    assert.equal((await send(url, {})).status, 400)
    assert.equal((await fetch(`${url}/api/messages`)).status, 404)
  })
})
test('database outage does not report success', async () => {
  await withServer({ isReady: () => false }, async (url) => {
    assert.equal((await send(url, valid)).status, 503)
    assert.equal((await fetch(`${url}/api/health`)).status, 503)
  })
})
test('storage failures return an honest service error', async () => {
  await withServer(
    {
      isReady: () => true,
      saveMessage: async () => {
        throw new Error('private database information')
      },
    },
    async (url) => {
      const response = await send(url, valid)
      assert.equal(response.status, 503)
      assert.ok(
        !JSON.stringify(await response.json()).includes('private database'),
      )
    },
  )
})
test('contact endpoint rate limits repeated submissions', async () => {
  await withServer(
    { isReady: () => true, saveMessage: async () => {} },
    async (url) => {
      for (let i = 0; i < 5; i++)
        assert.equal((await send(url, valid)).status, 201)
      assert.equal((await send(url, valid)).status, 429)
    },
  )
})
