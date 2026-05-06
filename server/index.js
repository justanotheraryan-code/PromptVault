import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDB } from './db.js'
import departmentsRouter from './routes/departments.js'
import promptsRouter from './routes/prompts.js'
import analyticsRouter from './routes/analytics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))
app.use('/api/departments', departmentsRouter)
app.use('/api/prompts', promptsRouter)
app.use('/api/analytics', analyticsRouter)

app.use((err, _req, res, _next) => {
  console.error('[api error]', err)
  res.status(500).json({ error: err.message || 'Server error' })
})

const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 8080

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`PromptVault API listening on :${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
