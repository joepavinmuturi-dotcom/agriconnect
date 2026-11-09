const express = require('express');
const db = require('../db');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();
const STATUSES = ['Placed', 'Confirmed', 'Dispatched', 'Delivered'];

const place = db.transaction((buyerId, items) => {
  const merged = new Map();
  for (const it of items) {
    const id = Number(it.produce_id);
    const qty = Number(it.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1) throw new Error('Invalid item in cart');
    merged.set(id, (merged.get(id) || 0) + qty);
  }
  const lines = [];
  let total = 0;
  for (const [id, qty] of merged) {
    const p = db.prepare('SELECT id, name, price, quantity FROM produce WHERE id = ? AND approved = 1').get(id);
    if (!p) throw new Error('A product in your cart is no longer available');
    if (qty > p.quantity) throw new Error('Only ' + p.quantity + ' of ' + p.name + ' left');
    lines.push({ p, qty });
    total += p.price * qty;
  }
  total = Math.round(total * 100) / 100;
  const order = db.prepare('INSERT INTO orders (buyer_id, total) VALUES (?, ?)').run(buyerId, total);
  for (const { p, qty } of lines) {
    db.prepare('INSERT INTO order_items (order_id, produce_id, quantity, unit_price) VALUES (?, ?, ?, ?)')
      .run(order.lastInsertRowid, p.id, qty, p.price);
    db.prepare('UPDATE produce SET quantity = quantity - ? WHERE id = ?').run(qty, p.id);
  }
  return order.lastInsertRowid;
});

router.post('/', requireRole('buyer'), (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }
  try {
    res.status(201).json({ id: place(req.session.user.id, items) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', requireLogin, (req, res) => {
  const u = req.session.user;
  const base = 'SELECT o.*, b.name AS buyer FROM orders o JOIN users b ON b.id = o.buyer_id';
  let rows;
  if (u.role === 'admin') {
    rows = db.prepare(base + ' ORDER BY o.id DESC').all();
  } else if (u.role === 'buyer') {
    rows = db.prepare(base + ' WHERE o.buyer_id = ? ORDER BY o.id DESC').all(u.id);
  } else {
    rows = db.prepare(base + ` WHERE o.id IN (SELECT oi.order_id FROM order_items oi
      JOIN produce p ON p.id = oi.produce_id WHERE p.farmer_id = ?) ORDER BY o.id DESC`).all(u.id);
  }
  res.json(rows);
});

router.get('/:id', requireLogin, (req, res) => {
  const u = req.session.user;
  const order = db.prepare('SELECT o.*, b.name AS buyer, b.email AS buyer_email FROM orders o JOIN users b ON b.id = o.buyer_id WHERE o.id = ?')
    .get(Number(req.params.id));
  if (!order || (u.role !== 'admin' && order.buyer_id !== u.id)) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.items = db.prepare(`SELECT oi.*, p.name, p.unit FROM order_items oi
    JOIN produce p ON p.id = oi.produce_id WHERE oi.order_id = ?`).all(order.id);
  res.json(order);
});

router.put('/:id/status', requireRole('admin'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const next = STATUSES[STATUSES.indexOf(order.status) + 1];
  if (!next || req.body.status !== next) {
    return res.status(400).json({ error: 'Status can only move to: ' + (next || 'nothing (already Delivered)') });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(next, order.id);
  res.json({ status: next });
});

module.exports = router;