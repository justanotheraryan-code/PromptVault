import mongoose from 'mongoose'

let connecting = null

export function connectDB() {
  if (connecting) return connecting
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it as an env var (Railway → Variables).')
  }
  mongoose.set('strictQuery', true)
  connecting = mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'promptvault' })
  return connecting
}
