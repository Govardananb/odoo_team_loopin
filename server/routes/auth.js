const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const db = require('../src/db/database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'traveloop-dev-secret-change-in-production'

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const id = uuidv4()
    db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, passwordHash)

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ token, user: { id, name, email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me — requires auth header
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token' })
    const { userId } = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, name, email, avatar_url FROM users WHERE id = ?').get(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
