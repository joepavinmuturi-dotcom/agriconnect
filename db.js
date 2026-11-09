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

if (process.env.SEED_DEMO === 'true' && db.prepare('SELECT COUNT(*) AS n FROM produce').get().n === 0) {
  const farmerEmail = 'demo.farmer@agriconnect.local';
  let farmer = db.prepare('SELECT id FROM users WHERE email = ?').get(farmerEmail);
  if (!farmer) {
    const info = db.prepare(`INSERT INTO users (name, email, password_hash, role, location, bio, approved)
      VALUES (?, ?, ?, 'farmer', ?, ?, 1)`).run(
      'Demo Farmer', farmerEmail,
      bcrypt.hashSync(require('crypto').randomBytes(12).toString('hex'), 10),
      'Nakuru', 'Mixed vegetable farmer');
    farmer = { id: info.lastInsertRowid };
  }
  const cat = (n) => db.prepare('SELECT id FROM categories WHERE name = ?').get(n).id;
  const add = db.prepare(`INSERT INTO produce (farmer_id, category_id, name, description, price, quantity, unit, location, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`);
  add.run(farmer.id, cat('Vegetables'), 'Tomatoes', 'Fresh red tomatoes', 80, 100, 'kg', 'Nakuru');
  add.run(farmer.id, cat('Vegetables'), 'Kale (Sukuma Wiki)', 'Bunches picked this morning', 30, 200, 'bunch', 'Nakuru');
  add.run(farmer.id, cat('Fruits'), 'Bananas', 'Sweet ripe bananas', 60, 150, 'kg', 'Kisii');
  add.run(farmer.id, cat('Grains'), 'Maize', 'Dry maize grain', 55, 500, 'kg', 'Eldoret');
}

module.exports = db;