const Database = require('better-sqlite3');
const path = require('path');
const { runMigrations } = require('./migrations');

const defaultDbPath = process.env.RENDER_DISK_ROOT
  ? path.join(process.env.RENDER_DISK_ROOT, 'oikos.db')
  : path.join(__dirname, '..', '..', 'oikos.db');
const DB_PATH = process.env.DB_PATH || defaultDbPath;

let db;

const getDb = () => {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
};

module.exports = { getDb };
