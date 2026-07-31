const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Multer setup for event poster uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

// Helper: generate unique ticket code
function generateTicketCode(eventId, userId) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const hash = crypto.createHash('md5').update(`${eventId}-${userId}-${timestamp}`).digest('hex').substring(0, 6).toUpperCase();
  return `KTP-${String(eventId).padStart(3, '0')}-${hash}-${timestamp.slice(-4)}`;
}

// Upload event poster image
router.post('/upload-poster', authenticateToken, requireRole('admin', 'moderator'), upload.single('poster'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) { res.status(500).json({ error: 'Upload failed.' }); }
});

// Get all SKill Up events
router.get('/', (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT se.*, u.full_name as organizer FROM skillup_events se JOIN users u ON se.admin_id = u.id WHERE 1=1';
    const params = [];
    if (category && category !== 'all') { query += ' AND se.category = ?'; params.push(category); }
    if (status && status !== 'all') { query += ' AND se.status = ?'; params.push(status); }
    query += ' ORDER BY se.event_date ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), (page - 1) * limit);
    const events = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM skillup_events').get().count;
    res.json({ events, total });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Get single event with full details
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT se.*, u.full_name as organizer FROM skillup_events se JOIN users u ON se.admin_id = u.id WHERE se.id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    const registrations = db.prepare('SELECT er.*, u.username, u.full_name, u.profile_photo FROM event_registrations er JOIN users u ON er.user_id = u.id WHERE er.event_id = ? ORDER BY er.registered_at DESC').all(req.params.id);
    res.json({ ...event, registrations });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Register for event - generates unique ticket
router.post('/:id/register', authenticateToken, (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (event.status === 'completed' || event.status === 'cancelled') return res.status(400).json({ error: 'Event is no longer accepting registrations.' });
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) return res.status(400).json({ error: 'Registration deadline has passed.' });
    if (event.max_participants > 0 && event.current_participants >= event.max_participants) return res.status(400).json({ error: 'Event is full.' });
    const existing = db.prepare('SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (existing) return res.status(409).json({ error: 'Already registered.', ticket: existing });

    const ticketCode = generateTicketCode(req.params.id, req.user.id);

    db.prepare('INSERT INTO event_registrations (event_id, user_id, ticket_code, status) VALUES (?, ?, ?, ?)').run(req.params.id, req.user.id, ticketCode, 'confirmed');
    db.prepare('UPDATE skillup_events SET current_participants = current_participants + 1 WHERE id = ?').run(req.params.id);
    db.prepare('INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)').run(req.user.id, 'Event Registration', `You have registered for "${event.title}". Your ticket code is ${ticketCode}`, 'event', `/skillup`);

    const registration = db.prepare('SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    res.status(201).json({ message: 'Registered successfully.', ticket: registration, event });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Get user's ticket for an event
router.get('/:id/my-ticket', authenticateToken, (req, res) => {
  try {
    const registration = db.prepare('SELECT er.*, se.title as event_title, se.event_date, se.event_end_date, se.location, se.category, se.image as event_image FROM event_registrations er JOIN skillup_events se ON er.event_id = se.id WHERE er.event_id = ? AND er.user_id = ?').get(req.params.id, req.user.id);
    if (!registration) return res.status(404).json({ error: 'No registration found.' });
    const user = db.prepare('SELECT full_name, username, email, profile_photo FROM users WHERE id = ?').get(req.user.id);
    res.json({ ...registration, user });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Cancel registration
router.delete('/:id/register', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Not registered.' });
    const event = db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(req.params.id);
    if (event && (event.status === 'completed' || event.status === 'ongoing')) return res.status(400).json({ error: 'Cannot cancel registration for an ongoing or completed event.' });
    db.prepare('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?').run(req.params.id, req.user.id);
    db.prepare('UPDATE skillup_events SET current_participants = MAX(0, current_participants - 1) WHERE id = ?').run(req.params.id);
    res.json({ message: 'Registration cancelled.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Mark attendance & award points (admin)
router.put('/:id/attendance', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { user_id, attended } = req.body;
    db.prepare('UPDATE event_registrations SET attended = ?, status = ? WHERE event_id = ? AND user_id = ?').run(attended ? 1 : 0, attended ? 'attended' : 'confirmed', req.params.id, user_id);
    if (attended) {
      const event = db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(req.params.id);
      const existing = db.prepare('SELECT * FROM points_ledger WHERE user_id = ? AND event_id = ? AND type = ?').get(user_id, req.params.id, 'earned');
      if (!existing && event) {
        db.prepare('INSERT INTO points_ledger (user_id, event_id, points, description, type) VALUES (?, ?, ?, ?, ?)').run(user_id, req.params.id, event.points_reward, `Attended: ${event.title}`, 'earned');
        db.prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?').run(event.points_reward, user_id);
        db.prepare('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)').run(user_id, 'Points Earned!', `You earned ${event.points_reward} points for attending "${event.title}"`, 'points');
      }
    }
    res.json({ message: 'Attendance updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Create event (admin - live, no maintenance needed)
router.post('/', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, category, location, points_reward, max_participants, event_date, event_end_date, registration_deadline, image, agenda, contact_email, contact_phone, requirements, tags, extra_data } = req.body;
    if (!title || !description || !event_date) return res.status(400).json({ error: 'Title, description, and event date required.' });

    const combinedExtra = JSON.stringify({
      ...(extra_data || {}),
      agenda: agenda || '',
      contact_email: contact_email || '',
      contact_phone: contact_phone || '',
      requirements: requirements || '',
      tags: tags || [],
    });

    const result = db.prepare('INSERT INTO skillup_events (admin_id, title, description, category, location, points_reward, max_participants, event_date, event_end_date, registration_deadline, image, extra_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.user.id, title, description, category || 'general', location, points_reward || 0, max_participants || 0, event_date, event_end_date, registration_deadline, image, combinedExtra);
    res.status(201).json(db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Update event (admin - live)
router.put('/:id', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { title, description, category, location, points_reward, max_participants, status, event_date, event_end_date, registration_deadline, image, agenda, contact_email, contact_phone, requirements, tags } = req.body;

    // If extra fields are provided, merge them with existing extra_data
    const existing = db.prepare('SELECT extra_data FROM skillup_events WHERE id = ?').get(req.params.id);
    let extraData = {};
    try { extraData = JSON.parse(existing?.extra_data || '{}'); } catch(e) {}
    if (agenda !== undefined) extraData.agenda = agenda;
    if (contact_email !== undefined) extraData.contact_email = contact_email;
    if (contact_phone !== undefined) extraData.contact_phone = contact_phone;
    if (requirements !== undefined) extraData.requirements = requirements;
    if (tags !== undefined) extraData.tags = tags;

    db.prepare('UPDATE skillup_events SET title=COALESCE(?,title), description=COALESCE(?,description), category=COALESCE(?,category), location=COALESCE(?,location), points_reward=COALESCE(?,points_reward), max_participants=COALESCE(?,max_participants), status=COALESCE(?,status), event_date=COALESCE(?,event_date), event_end_date=COALESCE(?,event_end_date), registration_deadline=COALESCE(?,registration_deadline), image=COALESCE(?,image), extra_data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(title, description, category, location, points_reward, max_participants, status, event_date, event_end_date, registration_deadline, image, JSON.stringify(extraData), req.params.id);
    res.json(db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Delete event (admin)
router.delete('/:id', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM skillup_events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    db.prepare('DELETE FROM event_registrations WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM skillup_events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// Leaderboard
router.get('/leaderboard/top', (req, res) => {
  try {
    const leaders = db.prepare('SELECT id, username, full_name, profile_photo, total_points FROM users WHERE role = ? ORDER BY total_points DESC LIMIT 20').all('youth');
    res.json(leaders);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
