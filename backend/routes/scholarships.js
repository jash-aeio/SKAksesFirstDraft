const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET all scholarships ───
router.get('/', (req, res) => {
  try {
    const { level, status = 'open', page = 1, limit = 20 } = req.query;
    let query = `SELECT * FROM scholarships WHERE status = ?`;
    const params = [status];

    if (level && level !== 'all') { query += ' AND level = ?'; params.push(level); }

    query += ' ORDER BY deadline ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const scholarships = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM scholarships WHERE status = ?').get(status).count;
    res.json({ scholarships, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scholarships.' });
  }
});

// ─── GET single scholarship ───
router.get('/:id', (req, res) => {
  try {
    const scholarship = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(req.params.id);
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found.' });

    let applied = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const user = jwt.verify(token, JWT_SECRET);
        const app = db.prepare('SELECT id FROM scholarship_applications WHERE scholarship_id = ? AND user_id = ?').get(req.params.id, user.id);
        if (app) applied = true;
      } catch (e) {}
    }

    res.json({ ...scholarship, applied });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Create scholarship ───
router.post('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, provider, description, level, requirements, benefits, slots, application_url, attachment_url, deadline } = req.body;
    if (!title || !provider || !deadline) return res.status(400).json({ error: 'Required fields missing.' });

    const result = db.prepare(
      `INSERT INTO scholarships (admin_id, title, provider, description, level, requirements, benefits, slots, application_url, attachment_url, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, provider, description, level || 'barangay', requirements, benefits, slots || 0, application_url, attachment_url, deadline);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Scholarship created.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── APPLY for scholarship (Internal tracking) ───
router.post('/:id/apply', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM scholarship_applications WHERE scholarship_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) return res.status(400).json({ error: 'Already applied or marked as interested.' });

    db.prepare('INSERT INTO scholarship_applications (scholarship_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
    res.status(201).json({ message: 'Marked as applied/interested.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
