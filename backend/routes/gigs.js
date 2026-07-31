const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET all open gigs ───
router.get('/', (req, res) => {
  try {
    const { category, type, page = 1, limit = 20 } = req.query;
    let query = `SELECT g.*, u.full_name as poster_name, u.profile_photo as poster_photo
                 FROM gig_postings g JOIN users u ON g.posted_by = u.id WHERE g.status = 'open'`;
    const params = [];

    if (category && category !== 'all') { query += ' AND g.category = ?'; params.push(category); }
    if (type && type !== 'all') { query += ' AND g.pay_type = ?'; params.push(type); }

    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const gigs = db.prepare(query).all(...params);
    const total = db.prepare("SELECT COUNT(*) as count FROM gig_postings WHERE status = 'open'").get().count;
    res.json({ gigs, total });
  } catch (err) {
    console.error('Gig GET error:', err);
    res.status(500).json({ error: 'Failed to fetch gigs.' });
  }
});

// ─── GET single gig with details ───
router.get('/:id', (req, res) => {
  try {
    const gig = db.prepare(
      `SELECT g.*, u.full_name as poster_name, u.username as poster_username, u.profile_photo as poster_photo
       FROM gig_postings g JOIN users u ON g.posted_by = u.id WHERE g.id = ?`
    ).get(req.params.id);
    if (!gig) return res.status(404).json({ error: 'Gig not found.' });

    // Include applications if requester is the poster
    let applications = [];
    // Auth is optional for GET, we need to check if token exists manually if we want to show apps
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const user = jwt.verify(token, JWT_SECRET);
        if (user.id === gig.posted_by || ['admin', 'moderator'].includes(user.role)) {
          applications = db.prepare(
            `SELECT a.*, u.full_name as applicant_name, u.username as applicant_username, u.profile_photo as applicant_photo, u.katips_id
             FROM gig_applications a JOIN users u ON a.user_id = u.id WHERE a.gig_id = ?`
          ).all(req.params.id);
        }
      } catch (e) {}
    }

    res.json({ ...gig, applications });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── POST a new gig (Admins/Verified business partners) ───
router.post('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, company_name, location, pay_range, pay_type, category, slots, requirements, contact_info, deadline } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    const result = db.prepare(
      `INSERT INTO gig_postings (posted_by, title, description, company_name, location, pay_range, pay_type, category, slots, requirements, contact_info, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, description, company_name, location, pay_range, pay_type || 'per_day', category || 'general', slots || 1, requirements, contact_info, deadline);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Gig posted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post gig.' });
  }
});

// ─── APPLY for a gig ───
router.post('/:id/apply', authenticateToken, (req, res) => {
  try {
    // Only verified users can apply
    const user = db.prepare('SELECT is_verified FROM users WHERE id = ?').get(req.user.id);
    if (!user || !user.is_verified) {
      return res.status(403).json({ error: 'Only verified users can apply for gigs.' });
    }

    const gig = db.prepare('SELECT * FROM gig_postings WHERE id = ?').get(req.params.id);
    if (!gig || gig.status !== 'open') {
      return res.status(400).json({ error: 'Gig is not available.' });
    }

    const existing = db.prepare('SELECT id FROM gig_applications WHERE gig_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) return res.status(400).json({ error: 'Already applied for this gig.' });

    const { message } = req.body;
    db.prepare('INSERT INTO gig_applications (gig_id, user_id, message) VALUES (?, ?, ?)').run(req.params.id, req.user.id, message || '');

    // Notify the poster
    db.prepare(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'service', ?)"
    ).run(
      gig.posted_by,
      'New Gig Application',
      `Someone applied for your gig "${gig.title}".`,
      `/services/katips-gig-board/${gig.id}`
    );

    res.status(201).json({ message: 'Application submitted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply.' });
  }
});

module.exports = router;
