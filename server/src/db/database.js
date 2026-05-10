const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const DB_PATH = path.join(__dirname, '../../data/traveloop.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    mood TEXT,
    budget_total REAL DEFAULT 0,
    budget_spent REAL DEFAULT 0,
    cover_image_url TEXT,
    share_id TEXT UNIQUE,
    is_public INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planning',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stops (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    place_name TEXT NOT NULL,
    place_type TEXT,
    notes TEXT,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    duration_minutes INTEGER,
    cost REAL DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

module.exports = db
