const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireRole('admin'));

router.get('/stats', (req, res) => {
  const n = (sql) => db.prepare(sql).get().n;
  res.json({
    farmers: n("SELECT COUNT(*) AS n FROM users WHERE role = 'farmer'"),
    pendingFarmers: n("SELECT COUNT(*) AS n FROM users WHERE role = 'farmer' AND approved = 0"),
    buyers: n("SELECT COUNT(*) AS n FROM users WHERE role = 'buyer'"),
    pendingListings: n('SELECT COUNT(*) AS n FROM produce WHERE approved = 0'),
    orders: n('SELECT COUNT(*) AS n FROM orders'),
  });
});

router.get('/farmers', (req, res) => {
  res.json(db.prepare("SELECT id, name, email, location, approved, created_at FROM users WHERE role = 'farmer' ORDER BY approved, id DESC").all());
});

router.put('/farmers/:id/approve', (req, res) => {
  const flag = req.body.approved === false ? 0 : 1;
  const info = db.prepare("UPDATE users SET approved = ? WHERE id = ? AND role = 'farmer'").run(flag, Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Farmer not found' });
  res.json({ approved: flag });
});

router.get('/produce', (req, res) => {
  res.json(db.prepare(`SELECT p.*, c.name AS category, u.name AS farmer FROM produce p
    JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.farmer_id
    ORDER BY p.approved, p.id DESC`).all());
});

router.put('/produce/:id/approve', (req, res) => {
  const flag = req.body.approved === false ? 0 : 1;
  const info = db.prepare('UPDATE produce SET approved = ? WHERE id = ?').run(flag, Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Listing not found' });
  res.json({ approved: flag });
});

module.exports = router;