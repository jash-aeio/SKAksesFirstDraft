const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get rewards catalog
router.get('/', (req, res) => {
  try {
    const rewards = db.prepare('SELECT * FROM rewards WHERE is_active = 1 ORDER BY points_cost ASC').all();
    res.json(rewards);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Get user points history
router.get('/points/history', authenticateToken, (req, res) => {
  try {
    const history = db.prepare('SELECT pl.*, se.title as event_title FROM points_ledger pl LEFT JOIN skillup_events se ON pl.event_id = se.id WHERE pl.user_id = ? ORDER BY pl.earned_at DESC').all(req.user.id);
    const total = db.prepare('SELECT total_points FROM users WHERE id = ?').get(req.user.id);
    res.json({ history, totalPoints: total.total_points });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Redeem reward
router.post('/:id/redeem', authenticateToken, (req, res) => {
  try {
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND is_active = 1').get(req.params.id);
    if (!reward) return res.status(404).json({ error: 'Reward not found.' });
    const user = db.prepare('SELECT total_points FROM users WHERE id = ?').get(req.user.id);
    if (user.total_points < reward.points_cost) return res.status(400).json({ error: 'Insufficient points.' });
    if (reward.quantity_available <= 0) return res.status(400).json({ error: 'Reward out of stock.' });

    db.prepare('INSERT INTO reward_redemptions (user_id, reward_id, points_spent) VALUES (?, ?, ?)').run(req.user.id, reward.id, reward.points_cost);
    db.prepare('INSERT INTO points_ledger (user_id, points, description, type) VALUES (?, ?, ?, ?)').run(req.user.id, -reward.points_cost, `Redeemed: ${reward.name}`, 'spent');
    db.prepare('UPDATE users SET total_points = total_points - ? WHERE id = ?').run(reward.points_cost, req.user.id);
    db.prepare('UPDATE rewards SET quantity_available = quantity_available - 1 WHERE id = ?').run(reward.id);

    db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(req.user.id, 'Reward Redeemed!', `You redeemed "${reward.name}" for ${reward.points_cost} points.`, 'points');
    res.json({ message: 'Reward redeemed successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Admin: manage rewards
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description, points_cost, quantity_available, image } = req.body;
    const result = db.prepare('INSERT INTO rewards (name, description, points_cost, quantity_available, image) VALUES (?, ?, ?, ?, ?)').run(name, description, points_cost, quantity_available, image);
    res.status(201).json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description, points_cost, quantity_available, image, is_active } = req.body;
    db.prepare('UPDATE rewards SET name=COALESCE(?,name), description=COALESCE(?,description), points_cost=COALESCE(?,points_cost), quantity_available=COALESCE(?,quantity_available), image=COALESCE(?,image), is_active=COALESCE(?,is_active) WHERE id=?').run(name, description, points_cost, quantity_available, image, is_active, req.params.id);
    res.json(db.prepare('SELECT * FROM rewards WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Get redemption history (admin)
router.get('/redemptions/all', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const redemptions = db.prepare('SELECT rr.*, u.username, u.full_name, r.name as reward_name FROM reward_redemptions rr JOIN users u ON rr.user_id = u.id JOIN rewards r ON rr.reward_id = r.id ORDER BY rr.redeemed_at DESC').all();
    res.json(redemptions);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
