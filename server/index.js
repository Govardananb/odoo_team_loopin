const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const tripRoutes = require('./routes/trips')
const shareRoutes = require('./routes/share')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/share', shareRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Traveloop server running on http://localhost:${PORT}`)
})

module.exports = app
