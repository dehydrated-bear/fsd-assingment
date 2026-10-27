import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createApp } from '../src/app.js'
import { initializeContent } from '../src/store.js'
import { hashPassword } from '../src/auth.js'
import { AdminSession } from '../src/models/Content.js'

test(
  'MongoDB integration: authenticated CMS, drafts, persistence, inbox, logout',
  { skip: process.env.RUN_MONGO_TESTS !== '1', timeout: 180000 },
  async () => {
    const database = await MongoMemoryServer.create()
    let server
    try {
      await mongoose.connect(database.getUri())
      await initializeContent()
      await AdminSession.init()
      server = createApp({
        adminEmail: 'admin@example.test',
        passwordHash: hashPassword('integration-only-password'),
      }).listen(0, '127.0.0.1')
      await new Promise((resolve) => server.once('listening', resolve))
      const base = `http://127.0.0.1:${server.address().port}/api`
      let cookie = ''
      let csrf = ''
      const request = async (path, method = 'GET', body, options = {}) =>
        fetch(`${base}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(cookie ? { Cookie: cookie, 'X-CSRF-Token': csrf } : {}),
            ...options,
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        })
      assert.equal((await request('/admin/site')).status, 401)
      assert.equal(
        (
          await request('/admin/login', 'POST', {
            email: 'admin@example.test',
            password: 'wrong',
          })
        ).status,
        401,
      )
      const login = await request('/admin/login', 'POST', {
        email: 'admin@example.test',
        password: 'integration-only-password',
      })
      assert.equal(login.status, 200)
      assert.match(login.headers.get('set-cookie'), /HttpOnly/)
      assert.match(login.headers.get('set-cookie'), /SameSite=Strict/)
      cookie = login.headers.get('set-cookie').split(';')[0]
      csrf = (await login.json()).csrf
      assert.ok(
        (await AdminSession.findOne()).tokenHash !== cookie.split('=')[1],
      )
      const site = await (await request('/site')).json()
      assert.equal(
        (await request('/admin/site', 'PUT', site, { 'X-CSRF-Token': '' }))
          .status,
        403,
      )
      assert.equal(
        (
          await request('/admin/site', 'PUT', site, {
            Origin: 'https://evil.invalid',
          })
        ).status,
        403,
      )
      site.profile.name = 'Updated name'
      assert.equal((await request('/admin/site', 'PUT', site)).status, 200)
      assert.equal(
        (await (await request('/site')).json()).profile.name,
        'Updated name',
      )
      assert.equal(
        (
          await request('/admin/site', 'PUT', {
            ...site,
            profile: { ...site.profile, timezone: 'not-a-zone' },
          })
        ).status,
        400,
      )
      const post = {
        slug: 'integration-post',
        title: 'A test post',
        category: 'Testing',
        date: '2026-10-27',
        readTime: '2 min',
        paragraphs: ['Plain text survives a round trip.'],
        published: false,
      }
      assert.equal((await request('/admin/posts', 'POST', post)).status, 201)
      assert.equal((await request('/posts/integration-post')).status, 404)
      assert.equal((await request('/admin/posts', 'POST', post)).status, 409)
      assert.equal(
        (
          await request('/admin/posts/integration-post', 'PUT', {
            ...post,
            published: true,
          })
        ).status,
        200,
      )
      assert.equal((await request('/posts/integration-post')).status, 200)
      assert.ok(
        (await (await request('/posts')).json()).some(
          (post) => post.slug === 'integration-post',
        ),
      )
      assert.equal(
        (
          await request('/messages', 'POST', {
            name: 'Visitor',
            email: 'visitor@example.test',
            message: 'A message for the inbox.',
          })
        ).status,
        201,
      )
      const inbox = await (await request('/admin/messages')).json()
      assert.equal(inbox.messages[0].message, 'A message for the inbox.')
      assert.equal(
        (
          await request(
            `/admin/messages/${inbox.messages[0]._id}`,
            'DELETE',
            {},
          )
        ).status,
        200,
      )
      assert.equal(
        (await request('/admin/posts/integration-post', 'DELETE', {})).status,
        200,
      )
      await initializeContent()
      assert.equal((await request('/posts/integration-post')).status, 404)
      assert.equal((await request('/admin/logout', 'POST', {})).status, 200)
      assert.equal((await request('/admin/session')).status, 401)
    } finally {
      if (server) await new Promise((resolve) => server.close(resolve))
      await mongoose.disconnect()
      await database.stop()
    }
  },
)
