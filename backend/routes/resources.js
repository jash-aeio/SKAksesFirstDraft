const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// ─── GET all available resources ───
router.get('/', (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    let query = `SELECT r.*, u.full_name as provider_name, u.profile_photo as provider_photo
                 FROM resources r JOIN users u ON r.user_id = u.id WHERE r.is_verified = 1`;
    const params = [];

    if (type && type !== 'all') { query += ' AND r.type = ?'; params.push(type); }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const resources = db.prepare(query).all(...params);
    const total = db.prepare("SELECT COUNT(*) as count FROM resources WHERE is_verified = 1").get().count;
    res.json({ resources, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources.' });
  }
});

// ─── POST a new resource ───
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, type, subject, file_url, external_link } = req.body;
    if (!title || !subject) return res.status(400).json({ error: 'Missing required fields.' });

    const result = db.prepare(
      `INSERT INTO resources (user_id, title, description, type, subject, file_url, external_link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, description, type || 'notes', subject, file_url, external_link);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Resource posted.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── DOWNLOAD/ACCESS a resource ───
router.post('/:id/download', authenticateToken, (req, res) => {
  try {
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) return res.status(400).json({ error: 'Resource unavailable.' });

    db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').run(req.params.id);

    res.status(200).json({ message: 'Download tracked.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
