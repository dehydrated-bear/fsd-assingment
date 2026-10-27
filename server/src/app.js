import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Message } from './models/Message.js'
import { validateMessage } from './validation.js'
import { contentRoutes } from './routes/content.js'
import { contentStore } from './store.js'

export function createApp({
  saveMessage = (data) => Message.create(data),
  isReady = () => Message.db.readyState === 1,
  store = contentStore,
  adminEmail,
  passwordHash,
} = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Google Fonts is optional; the page falls back to a local sans-serif.
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'https:'],
          'upgrade-insecure-requests':
            process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
    }),
  )
  app.use(express.json({ limit: '512kb' }))
  app.get('/api/health', (_req, res) => {
    const database = isReady()
    res
      .status(database ? 200 : 503)
      .json({ status: database ? 'ok' : 'unavailable', database })
  })
  app.post(
    '/api/messages',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many attempts. Please try again in 15 minutes.' },
    }),
    async (req, res) => {
      const result = validateMessage(req.body)
      if (result.error) return res.status(400).json({ error: result.error })
      if (!isReady())
        return res.status(503).json({
          error:
            'The contact service is temporarily unavailable. Please try again later.',
        })
      try {
        await saveMessage(result.data)
        return res.status(201).json({ message: 'Your message has been saved.' })
      } catch {
        return res.status(503).json({
          error: 'Your message could not be saved. Please try again later.',
        })
      }
    },
  )
  app.use('/api', contentRoutes({ store, adminEmail, passwordHash }))
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: 'API endpoint not found.' }),
  )
  const dist = fileURLToPath(
    new URL('../../portfolioweb/dist/', import.meta.url),
  )
  if (existsSync(dist)) {
    app.use(express.static(dist))
    app.get(['/admin', '/blog/:slug'], (_req, res) =>
      res.sendFile(`${dist}index.html`),
    )
  }
  app.use((error, _req, res, _next) => {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ error: 'That slug already exists. Choose another one.' })
    const status = error.status || 500
    res
      .status(status)
      .json({
        error:
          status < 500
            ? error.type === 'entity.parse.failed'
              ? 'Invalid JSON.'
              : error.message
            : 'The service could not complete the request. Please try again.',
      })
  })
  return app
}
