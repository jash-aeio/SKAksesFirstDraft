const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET all hazard reports (public feed) ───
router.get('/', (req, res) => {
  try {
    const { category, status, severity, page = 1, limit = 20 } = req.query;
    let query = `SELECT hr.*, u.full_name as reporter_name, u.username as reporter_username
                 FROM hazard_reports hr JOIN users u ON hr.user_id = u.id WHERE 1=1`;
    const params = [];

    if (category && category !== 'all') { query += ' AND hr.category = ?'; params.push(category); }
    if (status && status !== 'all') { query += ' AND hr.status = ?'; params.push(status); }
    if (severity && severity !== 'all') { query += ' AND hr.severity = ?'; params.push(severity); }

    query += ' ORDER BY hr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const reports = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM hazard_reports').get().count;

    // Stats for dashboard
    const stats = {
      total,
      pending: db.prepare("SELECT COUNT(*) as c FROM hazard_reports WHERE status='pending'").get().c,
      in_progress: db.prepare("SELECT COUNT(*) as c FROM hazard_reports WHERE status='in_progress'").get().c,
      resolved: db.prepare("SELECT COUNT(*) as c FROM hazard_reports WHERE status='resolved'").get().c,
    };

    res.json({ reports, total, stats });
  } catch (err) {
    console.error('Hazard GET error:', err);
    res.status(500).json({ error: 'Failed to fetch hazard reports.' });
  }
});

// ─── GET single report ───
router.get('/:id', (req, res) => {
  try {
    const report = db.prepare(
      `SELECT hr.*, u.full_name as reporter_name, u.username as reporter_username, u.profile_photo as reporter_photo
       FROM hazard_reports hr JOIN users u ON hr.user_id = u.id WHERE hr.id = ?`
    ).get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json(report);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── SUBMIT hazard report ───
router.post('/', authenticateToken, (req, res) => {
  try {
    const { category, description, image_url, latitude, longitude, address_text, severity } = req.body;
    if (!category || !description || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Category, description, and coordinates are required.' });
    }

    const result = db.prepare(
      `INSERT INTO hazard_reports (user_id, category, description, image_url, latitude, longitude, address_text, severity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, category, description, image_url || null, latitude, longitude, address_text || '', severity || 'medium');

    // Notify admins of new hazard report
    const admins = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'moderator')").all();
    const notifStmt = db.prepare(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'service', '/services/bantay-komunidad')"
    );
    for (const admin of admins) {
      notifStmt.run(
        admin.id,
        `⚠️ New Hazard Report: ${category}`,
        `A ${severity || 'medium'} severity "${category}" hazard has been reported. Location: ${address_text || 'See map pin'}`
      );
    }

    const report = db.prepare('SELECT * FROM hazard_reports WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(report);
  } catch (err) {
    console.error('Hazard POST error:', err);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// ─── ADMIN: Update report status ───
router.put('/:id', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const resolvedAt = (status === 'resolved') ? new Date().toISOString() : null;

    db.prepare(
      `UPDATE hazard_reports SET status=COALESCE(?,status), admin_notes=COALESCE(?,admin_notes),
       resolved_at=COALESCE(?,resolved_at), updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(status, admin_notes, resolvedAt, req.params.id);

    // Notify the reporter
    const report = db.prepare('SELECT * FROM hazard_reports WHERE id = ?').get(req.params.id);
    if (report && status) {
      db.prepare(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'service')"
      ).run(
        report.user_id,
        `📍 Hazard Report Updated`,
        `Your ${report.category} hazard report has been updated to: ${status}`
      );
    }

    res.json({ message: 'Report updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── User's own reports ───
router.get('/my/reports', authenticateToken, (req, res) => {
  try {
    const reports = db.prepare(
      'SELECT * FROM hazard_reports WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    res.json(reports);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
