import mongoose from 'mongoose'
import { createApp } from './app.js'
import { initializeContent } from './store.js'

if (!process.env.MONGODB_URI)
  throw new Error(
    'MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.',
  )
await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
await initializeContent()
const server = createApp().listen(Number(process.env.PORT) || 5000, () => {
  console.log(
    `Portfolio server listening on http://localhost:${process.env.PORT || 5000}`,
  )
})

async function shutdown() {
  server.close(async () => {
    await mongoose.disconnect()
    process.exit(0)
  })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
