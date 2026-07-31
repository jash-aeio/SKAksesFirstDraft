const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET agri content ───
router.get('/content', (req, res) => {
  try {
    const content = db.prepare('SELECT * FROM agri_content WHERE is_published = 1 ORDER BY created_at DESC').all();
    res.json(content);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Add content ───
router.post('/content', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, body, category, image_url } = req.body;
    db.prepare(
      'INSERT INTO agri_content (admin_id, title, body, category, image_url) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, title, body, category || 'urban_farming', image_url);
    res.status(201).json({ message: 'Content published.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── GET seed kits inventory ───
router.get('/kits', (req, res) => {
  try {
    const kits = db.prepare('SELECT * FROM seed_kit_inventory').all();
    res.json(kits);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── POST request a seed kit ───
router.post('/kits/request', authenticateToken, (req, res) => {
  try {
    const { kit_type, address, notes } = req.body;
    const existing = db.prepare('SELECT id FROM seed_kit_requests WHERE user_id = ? AND status IN ("pending", "approved")').get(req.user.id);
    if (existing) return res.status(400).json({ error: 'You already have an active seed kit request.' });

    db.prepare(
      'INSERT INTO seed_kit_requests (user_id, kit_type, address, notes) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, kit_type || 'starter', address, notes);
    
    res.status(201).json({ message: 'Seed kit requested.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
