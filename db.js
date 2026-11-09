require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const db = new Database(process.env.DB_PATH || path.join(__dirname, 'agriconnect.db'));
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

if (db.prepare('SELECT COUNT(*) AS n FROM categories').get().n === 0) {
  const ins = db.prepare('INSERT INTO categories (name) VALUES (?)');
  ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Herbs'].forEach((c) => ins.run(c));
}

if (!db.prepare("SELECT id FROM users WHERE role = 'admin'").get()) {
  const email = (process.env.ADMIN_EMAIL || 'admin@agriconnect.local').toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || 'Admin12345';
  db.prepare(
    'INSERT INTO users (name, email, password_hash, role, approved) VALUES (?, ?, ?, ?, 1)'
  ).run('Administrator', email, bcrypt.hashSync(pw, 10), 'admin');
}

module.exports = db;