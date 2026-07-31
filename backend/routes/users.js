const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { search, role, verified, page = 1, limit = 20 } = req.query;
    let query = 'SELECT id, username, email, full_name, role, profile_photo, is_verified, bio, barangay, total_points, created_at, youth_profiling_data, katips_id FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (verified !== undefined) {
      query += ' AND is_verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    const offset = (page - 1) * limit;
    const countQuery = query.replace('SELECT id, username, email, full_name, role, profile_photo, is_verified, bio, barangay, total_points, created_at, youth_profiling_data, katips_id', 'SELECT COUNT(*) as total');
    const total = db.prepare(countQuery).get(...params).total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const users = db.prepare(query).all(...params);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, full_name, role, profile_photo, is_verified, bio, barangay, total_points, created_at, youth_profiling_data, katips_id FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.id !== Number(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { full_name, bio, barangay, birthdate, youth_profiling_data, profile_photo } = req.body;
    let profilingJson = youth_profiling_data ? JSON.stringify(youth_profiling_data) : undefined;
    db.prepare('UPDATE users SET full_name = COALESCE(?, full_name), bio = COALESCE(?, bio), barangay = COALESCE(?, barangay), birthdate = COALESCE(?, birthdate), youth_profiling_data = COALESCE(?, youth_profiling_data), profile_photo = COALESCE(?, profile_photo), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(full_name, bio, barangay, birthdate, profilingJson, profile_photo, req.params.id);
    const user = db.prepare('SELECT id, username, email, full_name, role, profile_photo, is_verified, bio, barangay, total_points, created_at, youth_profiling_data, katips_id FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Verify user (admin)
router.put('/:id/verify', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const year = new Date().getFullYear();
    const idPad = String(req.params.id).padStart(5, '0');
    const katips_id = `LHY-${year}-${idPad}`;
    db.prepare('UPDATE users SET is_verified = 1, katips_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(katips_id, req.params.id);
    res.json({ message: 'User verified.', katips_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify user.' });
  }
});

// Delete user (admin)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ? AND role != ?').run(req.params.id, 'admin');
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Get analytics
router.get('/analytics/overview', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('youth').count;
    const verifiedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND is_verified = 1').get('youth').count;
    const newUsersThisMonth = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'youth' AND created_at >= date('now', 'start of month')").get().count;
    res.json({ totalUsers, verifiedUsers, newUsersThisMonth });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
