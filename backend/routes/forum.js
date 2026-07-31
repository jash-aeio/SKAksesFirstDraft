const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all threads
router.get('/', (req, res) => {
  try {
    const { category, status = 'active', search, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT t.*, u.username, u.full_name, u.profile_photo, u.is_verified,
      (SELECT COUNT(*) FROM forum_replies WHERE thread_id = t.id) as reply_count
      FROM forum_threads t
      JOIN users u ON t.user_id = u.id
      WHERE t.status != 'deleted'
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND t.category = ?';
      params.push(category);
    }
    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (t.title LIKE ? OR t.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (page - 1) * limit;
    const countBase = query.replace(/SELECT t\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
    const total = db.prepare(countBase).get(...params).total;

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const threads = db.prepare(query).all(...params);
    res.json({ threads, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch threads.' });
  }
});

// Get single thread with replies
router.get('/:id', (req, res) => {
  try {
    const thread = db.prepare(`
      SELECT t.*, u.username, u.full_name, u.profile_photo, u.is_verified
      FROM forum_threads t JOIN users u ON t.user_id = u.id WHERE t.id = ?
    `).get(req.params.id);

    if (!thread) return res.status(404).json({ error: 'Thread not found.' });

    // Increment views
    db.prepare('UPDATE forum_threads SET views = views + 1 WHERE id = ?').run(req.params.id);

    const replies = db.prepare(`
      SELECT r.*, u.username, u.full_name, u.profile_photo, u.is_verified
      FROM forum_replies r JOIN users u ON r.user_id = u.id
      WHERE r.thread_id = ? ORDER BY r.created_at ASC
    `).all(req.params.id);

    res.json({ ...thread, replies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch thread.' });
  }
});

// Create thread
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required.' });

    const result = db.prepare('INSERT INTO forum_threads (user_id, title, content, category) VALUES (?, ?, ?, ?)')
      .run(req.user.id, title, content, category || 'general');

    const thread = db.prepare(`
      SELECT t.*, u.username, u.full_name, u.profile_photo
      FROM forum_threads t JOIN users u ON t.user_id = u.id WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create thread.' });
  }
});

// Reply to thread
router.post('/:id/replies', authenticateToken, (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required.' });

    const thread = db.prepare('SELECT * FROM forum_threads WHERE id = ?').get(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found.' });

    const result = db.prepare('INSERT INTO forum_replies (thread_id, user_id, content) VALUES (?, ?, ?)')
      .run(req.params.id, req.user.id, content);

    const reply = db.prepare(`
      SELECT r.*, u.username, u.full_name, u.profile_photo
      FROM forum_replies r JOIN users u ON r.user_id = u.id WHERE r.id = ?
    `).get(result.lastInsertRowid);

    // Notify thread owner
    if (thread.user_id !== req.user.id) {
      db.prepare('INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)')
        .run(thread.user_id, 'New Reply', `Someone replied to your thread "${thread.title}"`, 'forum', `/forum/${thread.id}`);
    }

    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post reply.' });
  }
});

// Like thread
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM thread_likes WHERE user_id = ? AND thread_id = ?').get(req.user.id, req.params.id);
    if (existing) {
      db.prepare('DELETE FROM thread_likes WHERE user_id = ? AND thread_id = ?').run(req.user.id, req.params.id);
      db.prepare('UPDATE forum_threads SET likes = likes - 1 WHERE id = ?').run(req.params.id);
      return res.json({ liked: false });
    }
    db.prepare('INSERT INTO thread_likes (user_id, thread_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    db.prepare('UPDATE forum_threads SET likes = likes + 1 WHERE id = ?').run(req.params.id);
    res.json({ liked: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like thread.' });
  }
});

// Update thread status (admin/moderator)
router.put('/:id/status', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE forum_threads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Thread status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update thread.' });
  }
});

// Delete thread (admin/moderator or owner)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const thread = db.prepare('SELECT * FROM forum_threads WHERE id = ?').get(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found.' });

    if (thread.user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    db.prepare("UPDATE forum_threads SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.json({ message: 'Thread deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete thread.' });
  }
});

// Forum analytics (admin)
router.get('/analytics/overview', authenticateToken, requireRole('admin', 'moderator'), (req, res) => {
  try {
    const totalThreads = db.prepare("SELECT COUNT(*) as count FROM forum_threads WHERE status != 'deleted'").get().count;
    const totalReplies = db.prepare('SELECT COUNT(*) as count FROM forum_replies').get().count;
    const flaggedThreads = db.prepare("SELECT COUNT(*) as count FROM forum_threads WHERE status = 'flagged'").get().count;
    const categories = db.prepare("SELECT category, COUNT(*) as count FROM forum_threads WHERE status != 'deleted' GROUP BY category").all();
    res.json({ totalThreads, totalReplies, flaggedThreads, categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
