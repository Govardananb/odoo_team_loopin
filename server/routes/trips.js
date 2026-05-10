const express = require('express')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const db = require('../src/db/database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'traveloop-dev-secret-change-in-production'

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// GET /api/trips
router.get('/', auth, (req, res) => {
  const trips = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId)
  res.json({ trips })
})

// POST /api/trips
router.post('/', auth, (req, res) => {
  const { name, destination, startDate, endDate, mood, budgetTotal, coverImage, status } = req.body
  if (!name || !destination) return res.status(400).json({ error: 'Name and destination required' })
  const id = uuidv4()
  db.prepare(`
    INSERT INTO trips (id, user_id, name, destination, start_date, end_date, mood, budget_total, cover_image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.userId, name, destination, startDate || null, endDate || null, mood || null, budgetTotal || 0, coverImage || null, status || 'planning')
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id)
  res.status(201).json({ trip })
})

// GET /api/trips/:id
router.get('/:id', auth, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId)
  if (!trip) return res.status(404).json({ error: 'Not found' })
  const stops = db.prepare('SELECT * FROM stops WHERE trip_id = ? ORDER BY day_number, position').all(trip.id)
  const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC').all(trip.id)
  res.json({ trip, stops, expenses })
})

// PUT /api/trips/:id
router.put('/:id', auth, (req, res) => {
  const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId)
  if (!trip) return res.status(404).json({ error: 'Not found' })
  const { name, destination, startDate, endDate, mood, budgetTotal, status } = req.body
  db.prepare(`
    UPDATE trips SET name=?, destination=?, start_date=?, end_date=?, mood=?, budget_total=?, status=? WHERE id=?
  `).run(name, destination, startDate, endDate, mood, budgetTotal, status, req.params.id)
  res.json({ success: true })
})

// DELETE /api/trips/:id
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId)
  res.json({ success: true })
})

// --- Stops ---
// POST /api/trips/:id/stops
router.post('/:id/stops', auth, (req, res) => {
  const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId)
  if (!trip) return res.status(404).json({ error: 'Trip not found' })
  const { dayNumber, placeName, placeType, notes, position } = req.body
  const id = uuidv4()
  db.prepare('INSERT INTO stops (id, trip_id, day_number, place_name, place_type, notes, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, dayNumber, placeName, placeType || null, notes || null, position || 0)
  res.status(201).json({ stop: db.prepare('SELECT * FROM stops WHERE id = ?').get(id) })
})

// PUT /api/trips/:id/stops/reorder
router.put('/:id/stops/reorder', auth, (req, res) => {
  const { stops } = req.body // array of { id, position }
  const updateStmt = db.prepare('UPDATE stops SET position = ? WHERE id = ?')
  const reorder = db.transaction(() => {
    stops.forEach(s => updateStmt.run(s.position, s.id))
  })
  reorder()
  res.json({ success: true })
})

// DELETE /api/trips/:id/stops/:stopId
router.delete('/:id/stops/:stopId', auth, (req, res) => {
  db.prepare('DELETE FROM stops WHERE id = ? AND trip_id = ?').run(req.params.stopId, req.params.id)
  res.json({ success: true })
})

// --- Expenses ---
// POST /api/trips/:id/expenses
router.post('/:id/expenses', auth, (req, res) => {
  const { category, description, amount, date } = req.body
  const id = uuidv4()
  db.prepare('INSERT INTO expenses (id, trip_id, category, description, amount, date) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, category, description || null, amount, date || null)
  // Update budget_spent
  const total = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE trip_id = ?').get(req.params.id)
  db.prepare('UPDATE trips SET budget_spent = ? WHERE id = ?').run(total.total || 0, req.params.id)
  res.status(201).json({ expense: db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) })
})

// DELETE /api/trips/:id/expenses/:expId
router.delete('/:id/expenses/:expId', auth, (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ? AND trip_id = ?').run(req.params.expId, req.params.id)
  const total = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE trip_id = ?').get(req.params.id)
  db.prepare('UPDATE trips SET budget_spent = ? WHERE id = ?').run(total.total || 0, req.params.id)
  res.json({ success: true })
})

module.exports = router
