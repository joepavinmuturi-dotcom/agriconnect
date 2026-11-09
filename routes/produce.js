const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + EXT[file.mimetype]),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, Boolean(EXT[file.mimetype])),
});

const BASE = `SELECT p.*, c.name AS category, u.name AS farmer
  FROM produce p
  JOIN categories c ON c.id = p.category_id
  JOIN users u ON u.id = p.farmer_id`;

function validate(body) {
  const errors = [];
  const name = String(body.name || '').trim();
  const price = Number(body.price);
  const quantity = Number(body.quantity);
  const category_id = Number(body.category_id);
  if (name.length < 2 || name.length > 80) errors.push('Name must be 2 to 80 characters');
  if (!(price > 0) || price > 1000000) errors.push('Price must be greater than 0');
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1000000) errors.push('Quantity must be a whole number, 0 or more');
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id)) errors.push('Choose a valid category');
  return {
    errors,
    data: {
      name, price, quantity, category_id,
      unit: String(body.unit || 'kg').trim().slice(0, 15) || 'kg',
      location: String(body.location || '').trim().slice(0, 80),
      description: String(body.description || '').trim().slice(0, 500),
    },
  };
}

// ---------- public ----------
router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.get('/farmers', (req, res) => {
  res.json(db.prepare(`SELECT u.id, u.name, u.location, u.bio,
    (SELECT COUNT(*) FROM produce p WHERE p.farmer_id = u.id AND p.approved = 1) AS listings
    FROM users u WHERE u.role = 'farmer' AND u.approved = 1 ORDER BY u.name`).all());
});

router.get('/produce', (req, res) => {
  const where = ['p.approved = 1', 'u.approved = 1'];
  const args = [];
  const q = String(req.query.search || '').trim();
  if (q) { where.push('(p.name LIKE ? OR p.location LIKE ?)'); args.push('%' + q + '%', '%' + q + '%'); }
  const cat = Number(req.query.category);
  if (cat) { where.push('p.category_id = ?'); args.push(cat); }
  const max = Number(req.query.max);
  if (max > 0) { where.push('p.price <= ?'); args.push(max); }
  const farmer = Number(req.query.farmer);
  if (farmer) { where.push('p.farmer_id = ?'); args.push(farmer); }
  res.json(db.prepare(BASE + ' WHERE ' + where.join(' AND ') + ' ORDER BY p.created_at DESC').all(...args));
});

router.get('/produce/:id', (req, res) => {
  const row = db.prepare(BASE + ' WHERE p.id = ? AND p.approved = 1').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Produce not found' });
  res.json(row);
});

// ---------- farmer ----------
router.get('/my/produce', requireRole('farmer'), (req, res) => {
  res.json(db.prepare(BASE + ' WHERE p.farmer_id = ? ORDER BY p.created_at DESC').all(req.session.user.id));
});

router.post('/produce', requireRole('farmer'), upload.single('photo'), (req, res) => {
  const me = db.prepare('SELECT approved FROM users WHERE id = ?').get(req.session.user.id);
  if (!me || !me.approved) return res.status(403).json({ error: 'Your farmer account is not approved yet' });
  const { errors, data } = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });
  const info = db.prepare(`INSERT INTO produce (farmer_id, category_id, name, description, price, quantity, unit, photo, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    req.session.user.id, data.category_id, data.name, data.description, data.price,
    data.quantity, data.unit, req.file ? req.file.filename : null, data.location);
  res.status(201).json({ id: info.lastInsertRowid, message: 'Listing saved. It will show once an administrator approves it.' });
});

router.put('/produce/:id', requireRole('farmer'), upload.single('photo'), (req, res) => {
  const id = Number(req.params.id);
  const own = db.prepare('SELECT id FROM produce WHERE id = ? AND farmer_id = ?').get(id, req.session.user.id);
  if (!own) return res.status(404).json({ error: 'Listing not found' });
  const { errors, data } = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('. ') });
  db.prepare(`UPDATE produce SET category_id = ?, name = ?, description = ?, price = ?, quantity = ?, unit = ?,
    location = ?, photo = COALESCE(?, photo) WHERE id = ?`).run(
    data.category_id, data.name, data.description, data.price, data.quantity, data.unit,
    data.location, req.file ? req.file.filename : null, id);
  res.json({ message: 'Listing updated' });
});

router.delete('/produce/:id', requireRole('farmer'), (req, res) => {
  const id = Number(req.params.id);
  const own = db.prepare('SELECT id FROM produce WHERE id = ? AND farmer_id = ?').get(id, req.session.user.id);
  if (!own) return res.status(404).json({ error: 'Listing not found' });
  try {
    db.prepare('DELETE FROM produce WHERE id = ?').run(id);
  } catch (e) {
    // already used in an order: hide it instead of deleting history
    db.prepare('UPDATE produce SET approved = 0, quantity = 0 WHERE id = ?').run(id);
  }
  res.json({ message: 'Listing removed' });
});

module.exports = router;