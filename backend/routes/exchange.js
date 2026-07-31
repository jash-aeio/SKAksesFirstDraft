const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET all exchange opportunities ───
router.get('/', (req, res) => {
  try {
    const { type, scope, status = 'open', page = 1, limit = 20 } = req.query;
    let query = `SELECT e.*, u.full_name as author_name, u.profile_photo as author_photo
                 FROM exchange_opportunities e JOIN users u ON e.admin_id = u.id WHERE e.status = ?`;
    const params = [status];

    if (type && type !== 'all') { query += ' AND e.type = ?'; params.push(type); }
    if (scope && scope !== 'all') { query += ' AND e.scope = ?'; params.push(scope); }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const opportunities = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM exchange_opportunities WHERE status = ?').get(status).count;
    res.json({ opportunities, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities.' });
  }
});

// ─── GET single opportunity ───
router.get('/:id', (req, res) => {
  try {
    const opp = db.prepare(
      `SELECT e.*, u.full_name as author_name
       FROM exchange_opportunities e JOIN users u ON e.admin_id = u.id WHERE e.id = ?`
    ).get(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });

    res.json(opp);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Create opportunity ───
router.post('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, type, scope, organizer, location, application_url, image_url, deadline, event_start, event_end } = req.body;
    if (!title || !description || !organizer || !deadline) return res.status(400).json({ error: 'Missing required fields.' });

    const result = db.prepare(
      `INSERT INTO exchange_opportunities (admin_id, title, organizer, description, type, scope, location, application_url, image_url, deadline, event_start, event_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, organizer, description, type || 'seminar', scope || 'local', location || '', application_url, image_url, deadline, event_start, event_end);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Opportunity posted.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
