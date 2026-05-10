const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../src/db/database')

const router = express.Router()

// GET /api/share/:shareId — public, no auth needed
router.get('/:shareId', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE share_id = ? AND is_public = 1').get(req.params.shareId)
  if (!trip) return res.status(404).json({ error: 'Not found or not public' })
  const stops = db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY day_number, position').all(trip.id)
  res.json({ trip, stops })
})

// POST /api/share/:tripId — generate share link (auth needed)
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'traveloop-dev-secret-change-in-production'

router.post('/:tripId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let userId
  try {
    userId = jwt.verify(token, JWT_SECRET).userId
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.tripId, userId)
  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  const shareId = trip.share_id || uuidv4().split('-')[0]
  db.prepare('UPDATE trips SET share_id = ?, is_public = 1 WHERE id = ?').run(shareId, trip.id)
  res.json({ shareId, url: `/share/${shareId}` })
})

module.exports = router
