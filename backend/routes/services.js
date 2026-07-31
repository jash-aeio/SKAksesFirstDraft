const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY created_at DESC').all();
    res.json(services);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch services.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    res.json(service);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.get('/:id/logs', authenticateToken, (req, res) => {
  try {
    const isAdmin = ['admin','moderator'].includes(req.user.role);
    let query = 'SELECT sl.*, u.username, u.full_name FROM service_logs sl JOIN users u ON sl.user_id = u.id WHERE sl.service_id = ?';
    const params = [req.params.id];
    if (!isAdmin) { query += ' AND sl.user_id = ?'; params.push(req.user.id); }
    query += ' ORDER BY sl.created_at DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch logs.' }); }
});

router.post('/:id/logs', authenticateToken, (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    if (service.maintenance_mode) return res.status(503).json({ error: service.maintenance_message });
    const { details } = req.body;
    const result = db.prepare('INSERT INTO service_logs (service_id, user_id, details) VALUES (?, ?, ?)').run(req.params.id, req.user.id, details || '');
    res.status(201).json(db.prepare('SELECT * FROM service_logs WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed to create log.' }); }
});

router.put('/logs/:logId/status', authenticateToken, requireRole('admin','moderator'), (req, res) => {
  try {
    const { status, notes } = req.body;
    db.prepare('UPDATE service_logs SET status=?, notes=COALESCE(?,notes), updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, notes, req.params.logId);
    res.json({ message: 'Updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description, type, icon } = req.body;
    const result = db.prepare('INSERT INTO services (name, description, type, icon) VALUES (?, ?, ?, ?)').run(name, description, type || 'other', icon || '📋');
    res.status(201).json(db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description, type, icon, is_available, maintenance_mode, maintenance_message } = req.body;
    db.prepare('UPDATE services SET name=COALESCE(?,name), description=COALESCE(?,description), type=COALESCE(?,type), icon=COALESCE(?,icon), is_available=COALESCE(?,is_available), maintenance_mode=COALESCE(?,maintenance_mode), maintenance_message=COALESCE(?,maintenance_message) WHERE id=?').run(name, description, type, icon, is_available, maintenance_mode, maintenance_message, req.params.id);
    res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.get('/:id/analytics', authenticateToken, requireRole('admin','moderator'), (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM service_logs WHERE service_id = ?').get(req.params.id).count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM service_logs WHERE service_id = ? AND status = 'pending'").get(req.params.id).count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM service_logs WHERE service_id = ? AND status = 'completed'").get(req.params.id).count;
    res.json({ total, pending, completed });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
