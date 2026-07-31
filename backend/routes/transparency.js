const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const docs = db.prepare('SELECT td.*, u.full_name as author FROM transparency_docs td JOIN users u ON td.admin_id = u.id WHERE td.is_published = 1 ORDER BY td.published_at DESC').all();
    res.json(docs);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { title, type, description, file_path } = req.body;
    const result = db.prepare('INSERT INTO transparency_docs (admin_id, title, type, description, file_path) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, type || 'financial', description, file_path);
    res.status(201).json(db.prepare('SELECT * FROM transparency_docs WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try { db.prepare('DELETE FROM transparency_docs WHERE id = ?').run(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
