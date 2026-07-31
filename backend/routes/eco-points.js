const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET eco activities ───
router.get('/activities', (req, res) => {
  try {
    const activities = db.prepare('SELECT * FROM eco_activities WHERE is_active = 1').all();
    res.json(activities);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Add activity ───
router.post('/activities', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { name, description, points_value, category } = req.body;
    db.prepare(
      'INSERT INTO eco_activities (admin_id, name, description, points_value, category) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, name, description, points_value || 5, category || 'other');
    res.status(201).json({ message: 'Activity added.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── GET user's eco transactions ───
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(
      `SELECT t.*, a.name as activity_name, a.category 
       FROM eco_point_transactions t LEFT JOIN eco_activities a ON t.activity_id = a.id
       WHERE t.user_id = ? ORDER BY t.created_at DESC`
    ).all(req.user.id);
    
    const totalPoints = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM eco_point_transactions WHERE user_id = ?').get(req.user.id).total;
    
    res.json({ totalPoints, transactions });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Award points to user ───
router.post('/award', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { target_user_id, activity_id, points, notes } = req.body;
    db.prepare(
      'INSERT INTO eco_point_transactions (user_id, activity_id, points, scanned_by, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(target_user_id, activity_id || null, points, req.user.id, notes);
    
    // Add to main user points
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(points, target_user_id);
    
    res.status(200).json({ message: 'Points awarded successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
