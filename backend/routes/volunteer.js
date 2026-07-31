const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET all volunteer opportunities ───
router.get('/opportunities', (req, res) => {
  try {
    const { category, status = 'active', page = 1, limit = 20 } = req.query;
    let query = `SELECT v.*, u.full_name as author_name, u.profile_photo as author_photo
                 FROM volunteer_opportunities v JOIN users u ON v.admin_id = u.id WHERE v.status = ?`;
    const params = [status];

    if (category && category !== 'all') { query += ' AND v.category = ?'; params.push(category); }

    query += ' ORDER BY v.event_date ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const opportunities = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM volunteer_opportunities WHERE status = ?').get(status).count;
    res.json({ opportunities, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities.' });
  }
});

// ─── GET single opportunity ───
router.get('/opportunities/:id', (req, res) => {
  try {
    const opp = db.prepare(
      `SELECT v.*, u.full_name as author_name
       FROM volunteer_opportunities v JOIN users u ON v.admin_id = u.id WHERE v.id = ?`
    ).get(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });

    let userSwipe = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const user = jwt.verify(token, JWT_SECRET);
        const swipe = db.prepare('SELECT action FROM volunteer_swipes WHERE opportunity_id = ? AND user_id = ?').get(req.params.id, user.id);
        if (swipe) userSwipe = swipe.action;
      } catch (e) {}
    }

    res.json({ ...opp, userSwipe });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── SWIPE (Commit/Skip) ───
router.post('/swipe', authenticateToken, (req, res) => {
  try {
    const { opportunity_id, action } = req.body;
    if (!['commit', 'skip'].includes(action)) return res.status(400).json({ error: 'Invalid action.' });

    const existing = db.prepare('SELECT id, action FROM volunteer_swipes WHERE opportunity_id = ? AND user_id = ?').get(opportunity_id, req.user.id);
    if (existing) {
      if (existing.action !== action) {
        // Update action if already swiped (e.g. changing mind from skip to commit)
        db.prepare('UPDATE volunteer_swipes SET action = ? WHERE id = ?').run(action, existing.id);
        
        if (action === 'commit') {
          db.prepare('UPDATE volunteer_opportunities SET filled_slots = filled_slots + 1 WHERE id = ?').run(opportunity_id);
        } else if (action === 'skip' && existing.action === 'commit') {
          db.prepare('UPDATE volunteer_opportunities SET filled_slots = MAX(0, filled_slots - 1) WHERE id = ?').run(opportunity_id);
        }
      }
    } else {
      db.prepare('INSERT INTO volunteer_swipes (user_id, opportunity_id, action) VALUES (?, ?, ?)').run(req.user.id, opportunity_id, action);
      if (action === 'commit') {
        db.prepare('UPDATE volunteer_opportunities SET filled_slots = filled_slots + 1 WHERE id = ?').run(opportunity_id);
      }
    }

    res.status(200).json({ message: 'Swiped successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Add opportunity ───
router.post('/opportunities', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, location, category, skills_needed, event_date, event_end, slots, points_reward, image_url } = req.body;
    db.prepare(
      `INSERT INTO volunteer_opportunities (admin_id, title, description, location, category, skills_needed, event_date, event_end, slots, points_reward, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, description, location, category || 'community', skills_needed, event_date, event_end, slots || 10, points_reward || 10, image_url);
    res.status(201).json({ message: 'Opportunity added.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
