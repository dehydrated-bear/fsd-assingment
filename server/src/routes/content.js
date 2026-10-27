import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { siteInput, postInput, parseInput } from '../contentValidation.js'
import {
  verifyPassword,
  readToken,
  newSession,
  hashToken,
  cookieOptions,
} from '../auth.js'

export function contentRoutes({
  store,
  adminEmail = process.env.ADMIN_EMAIL,
  passwordHash = process.env.ADMIN_PASSWORD_HASH,
}) {
  const router = Router()
  router.get('/site', async (_req, res) => {
    const site = await store.getSite()
    if (!site)
      return res
        .status(503)
        .json({ error: 'Site content has not been initialized.' })
    res.json(site)
  })
  router.get('/posts', async (_req, res) => res.json(await store.listPosts()))
  router.get('/posts/:slug', async (req, res) => {
    const post = await store.getPost(req.params.slug)
    if (!post) return res.status(404).json({ error: 'Article not found.' })
    res.json(post)
  })
  router.use('/admin', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (['GET', 'HEAD'].includes(req.method)) return next()
    const origin = req.get('origin')
    const expected =
      process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`
    if (origin && origin !== expected)
      return res
        .status(403)
        .json({ error: 'Cross-origin admin requests are not allowed.' })
    if (!req.is('application/json'))
      return res.status(415).json({ error: 'Use application/json.' })
    next()
  })
  router.post(
    '/admin/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    }),
    async (req, res) => {
      if (!adminEmail || !passwordHash)
        return res
          .status(503)
          .json({
            error:
              'Admin login is not configured. Follow the setup instructions.',
          })
      const matches = verifyPassword(req.body?.password, passwordHash)
      if (req.body?.email !== adminEmail || !matches)
        return res.status(401).json({ error: 'Invalid email or password.' })
      const session = newSession()
      await store.createSession({
        tokenHash: session.tokenHash,
        csrf: session.csrf,
        expiresAt: session.expiresAt,
      })
      res
        .cookie('portfolio_session', session.token, cookieOptions())
        .json({ csrf: session.csrf, email: adminEmail })
    },
  )
  router.use('/admin', async (req, res, next) => {
    const token = readToken(req)
    if (!/^[a-f0-9]{64}$/.test(token))
      return res.status(401).json({ error: 'Please sign in.' })
    const session = await store.getSession(hashToken(token))
    if (!session)
      return res
        .status(401)
        .json({ error: 'Your session has expired. Please sign in again.' })
    if (
      !['GET', 'HEAD'].includes(req.method) &&
      req.get('x-csrf-token') !== session.csrf
    )
      return res
        .status(403)
        .json({ error: 'Invalid security token. Refresh and sign in again.' })
    req.adminSession = session
    next()
  })
  router.get('/admin/session', (req, res) =>
    res.json({ csrf: req.adminSession.csrf, email: adminEmail }),
  )
  router.post('/admin/logout', async (req, res) => {
    await store.deleteSession(hashToken(readToken(req)))
    res
      .clearCookie('portfolio_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/admin',
      })
      .json({ message: 'Signed out.' })
  })
  router.get('/admin/site', async (_req, res) =>
    res.json(await store.getSite()),
  )
  router.put('/admin/site', async (req, res) =>
    res.json(await store.saveSite(parseInput(siteInput, req.body))),
  )
  router.get('/admin/posts', async (_req, res) =>
    res.json(await store.listPosts(true)),
  )
  router.post('/admin/posts', async (req, res) =>
    res
      .status(201)
      .json(await store.createPost(parseInput(postInput, req.body))),
  )
  router.put('/admin/posts/:slug', async (req, res) => {
    const post = await store.updatePost(
      req.params.slug,
      parseInput(postInput, req.body),
    )
    if (!post) return res.status(404).json({ error: 'Article not found.' })
    res.json(post)
  })
  router.delete('/admin/posts/:slug', async (req, res) => {
    if (!(await store.deletePost(req.params.slug)))
      return res.status(404).json({ error: 'Article not found.' })
    res.json({ message: 'Article deleted.' })
  })
  router.get('/admin/messages', async (req, res) => {
    const page = Math.min(
      10000,
      Math.max(1, Number.parseInt(req.query.page, 10) || 1),
    )
    res.json({ page, messages: await store.listMessages(page) })
  })
  router.delete('/admin/messages/:id', async (req, res) => {
    if (!/^[a-f\d]{24}$/i.test(req.params.id))
      return res.status(400).json({ error: 'Invalid message ID.' })
    if (!(await store.deleteMessage(req.params.id)))
      return res.status(404).json({ error: 'Message not found.' })
    res.json({ message: 'Message deleted.' })
  })
  return router
}
