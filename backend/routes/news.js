const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all news/events
router.get('/', (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    let query = 'SELECT ne.*, u.full_name as author_name FROM news_events ne JOIN users u ON ne.admin_id = u.id WHERE ne.is_published = 1';
    const params = [];
    if (type && type !== 'all') { query += ' AND ne.type = ?'; params.push(type); }
    query += ' ORDER BY ne.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (page - 1) * limit);
    const items = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM news_events WHERE is_published = 1').get().count;
    res.json({ items, total });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch news.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT ne.*, u.full_name as author_name FROM news_events ne JOIN users u ON ne.admin_id = u.id WHERE ne.id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch item.' }); }
});

router.post('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, type, poster_image, hyperlink, event_date, event_location } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required.' });
    const result = db.prepare('INSERT INTO news_events (admin_id, title, description, type, poster_image, hyperlink, event_date, event_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id, title, description, type || 'news', poster_image, hyperlink, event_date, event_location);
    res.status(201).json(db.prepare('SELECT * FROM news_events WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed to create.' }); }
});

router.put('/:id', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, type, poster_image, hyperlink, event_date, event_location, is_published } = req.body;
    db.prepare('UPDATE news_events SET title=COALESCE(?,title), description=COALESCE(?,description), type=COALESCE(?,type), poster_image=COALESCE(?,poster_image), hyperlink=COALESCE(?,hyperlink), event_date=COALESCE(?,event_date), event_location=COALESCE(?,event_location), is_published=COALESCE(?,is_published), updated_at=CURRENT_TIMESTAMP WHERE id=?').run(title, description, type, poster_image, hyperlink, event_date, event_location, is_published, req.params.id);
    res.json(db.prepare('SELECT * FROM news_events WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: 'Failed to update.' }); }
});

router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try { db.prepare('DELETE FROM news_events WHERE id = ?').run(req.params.id); res.json({ message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete.' }); }
});

module.exports = router;
