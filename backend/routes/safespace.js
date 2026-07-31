const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const {
  requireSafeSpaceAccess,
  logSafeSpaceAccess,
  bypassGeneralLogging,
} = require('../middleware/safespace');

const router = express.Router();

// ─── SUBMIT a report (any authenticated user) ───
router.post('/', authenticateToken, bypassGeneralLogging, (req, res) => {
  try {
    const { type, urgency, narrative, contact_preference, contact_details, is_anonymous } = req.body;
    if (!type || !narrative) {
      return res.status(400).json({ error: 'Type and narrative are required.' });
    }

    const result = db.prepare(
      `INSERT INTO safespace_reports
         (reporter_id, type, urgency, narrative, contact_preference, contact_details, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id,
      type,
      urgency || 'normal',
      narrative,
      contact_preference || 'in_app',
      contact_details || null,
      is_anonymous ? 1 : 0
    );

    // NO general notification created — isolated by design
    res.status(201).json({ message: 'Report submitted securely.', id: result.lastInsertRowid });
  } catch (err) {
    console.error('SafeSpace submit error:', err);
    res.status(500).json({ error: 'Submission failed.' });
  }
});

// ─── User: check own report status (limited view, no counselor notes) ───
router.get('/my/status', authenticateToken, (req, res) => {
  try {
    const reports = db.prepare(
      `SELECT id, type, urgency, status, created_at, updated_at
       FROM safespace_reports WHERE reporter_id = ?
       ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json(reports);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── GET all reports (SafeSpace roles ONLY) ───
router.get(
  '/',
  authenticateToken,
  requireSafeSpaceAccess,
  logSafeSpaceAccess('view_list'),
  (req, res) => {
    try {
      const { status, type, urgency } = req.query;
      let query = `SELECT sr.id, sr.type, sr.urgency, sr.status, sr.is_anonymous,
                          sr.created_at, sr.updated_at, sr.assigned_to,
                          CASE WHEN sr.is_anonymous = 1 THEN 'Anonymous'
                               ELSE u.full_name END as reporter_name
                   FROM safespace_reports sr
                   JOIN users u ON sr.reporter_id = u.id WHERE 1=1`;
      const params = [];
      if (status) { query += ' AND sr.status = ?'; params.push(status); }
      if (type)   { query += ' AND sr.type = ?';   params.push(type); }
      if (urgency) { query += ' AND sr.urgency = ?'; params.push(urgency); }
      query += ' ORDER BY CASE sr.urgency WHEN \'emergency\' THEN 1 WHEN \'high\' THEN 2 WHEN \'normal\' THEN 3 ELSE 4 END, sr.created_at DESC';
      res.json(db.prepare(query).all(...params));
    } catch (err) {
      console.error('SafeSpace list error:', err);
      res.status(500).json({ error: 'Failed.' });
    }
  }
);

// ─── GET single report detail (SafeSpace roles ONLY) ───
router.get(
  '/:id',
  authenticateToken,
  requireSafeSpaceAccess,
  logSafeSpaceAccess('view_report'),
  (req, res) => {
    try {
      const report = db.prepare(
        `SELECT sr.*,
                CASE WHEN sr.is_anonymous = 1 THEN 'Anonymous'
                     ELSE u.full_name END as reporter_name,
                CASE WHEN sr.is_anonymous = 1 THEN NULL
                     ELSE u.email END as reporter_email
         FROM safespace_reports sr
         JOIN users u ON sr.reporter_id = u.id
         WHERE sr.id = ?`
      ).get(req.params.id);
      if (!report) return res.status(404).json({ error: 'Report not found.' });
      res.json(report);
    } catch (err) { res.status(500).json({ error: 'Failed.' }); }
  }
);

// ─── UPDATE report (SafeSpace roles ONLY) ───
router.put(
  '/:id',
  authenticateToken,
  requireSafeSpaceAccess,
  logSafeSpaceAccess('update_status'),
  (req, res) => {
    try {
      const { status, counselor_notes, assigned_to } = req.body;
      db.prepare(
        `UPDATE safespace_reports
         SET status = COALESCE(?, status),
             counselor_notes = COALESCE(?, counselor_notes),
             assigned_to = COALESCE(?, assigned_to),
             resolved_at = CASE WHEN ? IN ('resolved','closed') THEN CURRENT_TIMESTAMP ELSE resolved_at END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(status, counselor_notes, assigned_to, status, req.params.id);
      res.json({ message: 'Report updated.' });
    } catch (err) { res.status(500).json({ error: 'Failed.' }); }
  }
);

// ─── GET SafeSpace stats (counselor dashboard) ───
router.get(
  '/dashboard/stats',
  authenticateToken,
  requireSafeSpaceAccess,
  (req, res) => {
    try {
      const total = db.prepare('SELECT COUNT(*) as c FROM safespace_reports').get().c;
      const newReports = db.prepare("SELECT COUNT(*) as c FROM safespace_reports WHERE status = 'new'").get().c;
      const inProgress = db.prepare("SELECT COUNT(*) as c FROM safespace_reports WHERE status = 'in_progress'").get().c;
      const emergency = db.prepare("SELECT COUNT(*) as c FROM safespace_reports WHERE urgency = 'emergency' AND status NOT IN ('resolved','closed')").get().c;
      res.json({ total, new: newReports, in_progress: inProgress, emergency });
    } catch (err) { res.status(500).json({ error: 'Failed.' }); }
  }
);

module.exports = router;
