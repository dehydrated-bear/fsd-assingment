import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from 'node:crypto'
export const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex')
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
export function verifyPassword(password, stored) {
  if (
    typeof password !== 'string' ||
    password.length > 256 ||
    typeof stored !== 'string'
  )
    return false
  const [salt, encoded] = stored.split(':')
  if (
    !/^[a-f0-9]{32}$/.test(salt || '') ||
    !/^[a-f0-9]{128}$/.test(encoded || '')
  )
    return false
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(encoded, 'hex'),
  )
}
export function readToken(req) {
  return (
    (req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('portfolio_session='))
      ?.slice('portfolio_session='.length) || ''
  )
}
export function newSession() {
  const token = randomBytes(32).toString('hex')
  return {
    token,
    tokenHash: hashToken(token),
    csrf: randomBytes(24).toString('hex'),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  }
}
export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/admin',
  maxAge: 8 * 60 * 60 * 1000,
})
