const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── Helper: check threshold and trigger mandatory agenda ───
function checkMandatoryAgenda(proposalId) {
  const threshold = db.prepare("SELECT value FROM app_config WHERE key = 'proposal_upvote_threshold'").get();
  const limit = parseInt(threshold?.value || '100', 10);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(proposalId);

  if (proposal && proposal.upvote_count >= limit && !proposal.is_mandatory_agenda) {
    db.prepare(
      "UPDATE proposals SET status = 'mandatory_agenda', is_mandatory_agenda = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(proposalId);

    // Notify all admins
    const admins = db.prepare("SELECT id FROM users WHERE role IN ('admin', 'moderator')").all();
    const notifStmt = db.prepare(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'proposal', '/services/e-panukala')"
    );
    for (const admin of admins) {
      notifStmt.run(
        admin.id,
        '🏛️ Mandatory Agenda Triggered',
        `Proposal "${proposal.title}" has reached ${proposal.upvote_count} upvotes and is now a Mandatory Agenda item.`
      );
    }

    // Notify the proposal author
    db.prepare(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'proposal', '/services/e-panukala')"
    ).run(
      proposal.user_id,
      '🎉 Your Proposal Reached Mandatory Agenda!',
      `Your proposal "${proposal.title}" has been elevated to Mandatory Agenda status with ${proposal.upvote_count} upvotes.`
    );

    return true;
  }
  return false;
}

// ─── GET all proposals ───
router.get('/', (req, res) => {
  try {
    const { category, status, sort, page = 1, limit = 20 } = req.query;
    let query = `SELECT p.*, u.full_name as author_name, u.username as author_username, u.profile_photo as author_photo
                 FROM proposals p JOIN users u ON p.user_id = u.id WHERE p.status != 'draft'`;
    const params = [];

    if (category && category !== 'all') { query += ' AND p.category = ?'; params.push(category); }
    if (status && status !== 'all') { query += ' AND p.status = ?'; params.push(status); }

    if (sort === 'top') {
      query += ' ORDER BY p.upvote_count DESC';
    } else if (sort === 'oldest') {
      query += ' ORDER BY p.created_at ASC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const proposals = db.prepare(query).all(...params);
    const total = db.prepare("SELECT COUNT(*) as count FROM proposals WHERE status != 'draft'").get().count;
    res.json({ proposals, total });
  } catch (err) {
    console.error('Proposals GET error:', err);
    res.status(500).json({ error: 'Failed to fetch proposals.' });
  }
});

// ─── GET single proposal ───
router.get('/:id', (req, res) => {
  try {
    const proposal = db.prepare(
      `SELECT p.*, u.full_name as author_name, u.username as author_username, u.profile_photo as author_photo
       FROM proposals p JOIN users u ON p.user_id = u.id WHERE p.id = ?`
    ).get(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });
    res.json(proposal);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── GET user's own drafts ───
router.get('/my/drafts', authenticateToken, (req, res) => {
  try {
    const drafts = db.prepare(
      "SELECT * FROM proposals WHERE user_id = ? ORDER BY updated_at DESC"
    ).all(req.user.id);
    res.json(drafts);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── CREATE proposal (draft or publish) ───
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, summary, body, category, publish } = req.body;
    if (!title || !summary || !body) {
      return res.status(400).json({ error: 'Title, summary, and body are required.' });
    }

    const status = publish ? 'published' : 'draft';
    const result = db.prepare(
      `INSERT INTO proposals (user_id, title, summary, body, category, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, title, summary, body, category || 'general', status);

    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(proposal);
  } catch (err) {
    console.error('Proposal create error:', err);
    res.status(500).json({ error: 'Failed to create proposal.' });
  }
});

// ─── UPDATE proposal ───
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });

    // Only author can edit their own; admins can update status/notes
    const isAuthor = proposal.user_id === req.user.id;
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Not authorized.' });

    const { title, summary, body, category, status, admin_notes, publish } = req.body;

    if (isAuthor && !isAdmin) {
      // Author can only edit if still draft or published
      if (!['draft', 'published'].includes(proposal.status)) {
        return res.status(400).json({ error: 'Cannot edit a proposal that is already under review.' });
      }
      const newStatus = publish ? 'published' : (status || proposal.status);
      db.prepare(
        `UPDATE proposals SET title=COALESCE(?,title), summary=COALESCE(?,summary), body=COALESCE(?,body),
         category=COALESCE(?,category), status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
      ).run(title, summary, body, category, newStatus, req.params.id);
    } else {
      // Admin can update status and notes
      db.prepare(
        `UPDATE proposals SET status=COALESCE(?,status), admin_notes=COALESCE(?,admin_notes),
         updated_at=CURRENT_TIMESTAMP WHERE id=?`
      ).run(status, admin_notes, req.params.id);
    }

    res.json(db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── UPVOTE / REMOVE VOTE ───
router.post('/:id/vote', authenticateToken, (req, res) => {
  try {
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });
    if (proposal.status === 'draft') return res.status(400).json({ error: 'Cannot vote on drafts.' });

    const existingVote = db.prepare(
      'SELECT * FROM proposal_votes WHERE user_id = ? AND proposal_id = ?'
    ).get(req.user.id, req.params.id);

    if (existingVote) {
      // Remove vote
      db.prepare('DELETE FROM proposal_votes WHERE user_id = ? AND proposal_id = ?').run(req.user.id, req.params.id);
      db.prepare('UPDATE proposals SET upvote_count = MAX(0, upvote_count - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
      const updated = db.prepare('SELECT upvote_count FROM proposals WHERE id = ?').get(req.params.id);
      return res.json({ voted: false, upvote_count: updated.upvote_count });
    } else {
      // Add vote
      db.prepare('INSERT INTO proposal_votes (user_id, proposal_id) VALUES (?, ?)').run(req.user.id, req.params.id);
      db.prepare('UPDATE proposals SET upvote_count = upvote_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
      const updated = db.prepare('SELECT upvote_count FROM proposals WHERE id = ?').get(req.params.id);

      // Check if threshold reached
      checkMandatoryAgenda(req.params.id);

      return res.json({ voted: true, upvote_count: updated.upvote_count });
    }
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to process vote.' });
  }
});

// ─── CHECK if user voted ───
router.get('/:id/my-vote', authenticateToken, (req, res) => {
  try {
    const vote = db.prepare('SELECT * FROM proposal_votes WHERE user_id = ? AND proposal_id = ?').get(req.user.id, req.params.id);
    res.json({ voted: !!vote });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── DELETE proposal (author or admin) ───
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Not found.' });
    const isAuthor = proposal.user_id === req.user.id;
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Not authorized.' });
    db.prepare('DELETE FROM proposal_votes WHERE proposal_id = ?').run(req.params.id);
    db.prepare('DELETE FROM proposals WHERE id = ?').run(req.params.id);
    res.json({ message: 'Proposal deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
