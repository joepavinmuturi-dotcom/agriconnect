const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
const EMAIL_RE = /^[^@ ]+@[^@ ]+[.][^@ ]+$/;
const clean = (v) => String(v || '').trim();

router.post('/register', (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  const role = clean(req.body.role);
  const phone = clean(req.body.phone).slice(0, 20);
  const location = clean(req.body.location).slice(0, 80);

  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Name must be 2 to 60 characters' });
  if (!EMAIL_RE.test(email) || email.length > 100) return res.status(400).json({ error: 'Enter a valid email address' });
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password needs 8+ characters with a letter and a number' });
  }
  if (!['farmer', 'buyer'].includes(role)) return res.status(400).json({ error: 'Choose Farmer or Buyer' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'That email is already registered' });
  }

  const approved = role === 'farmer' ? 0 : 1;
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, role, phone, location, approved) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, email, bcrypt.hashSync(password, 10), role, phone, location, approved);

  res.status(201).json({
    id: info.lastInsertRowid,
    message: role === 'farmer'
      ? 'Registered. An administrator must approve your farmer account.'
      : 'Registered. You can now log in.',
  });
});

router.post('/login', (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Login failed' });
    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.json({ user: { ...req.session.user, approved: user.approved } });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.json({ user: null });
  const row = db.prepare('SELECT approved FROM users WHERE id = ?').get(req.session.user.id);
  res.json({ user: { ...req.session.user, approved: row ? row.approved : 0 } });
});

module.exports = router;