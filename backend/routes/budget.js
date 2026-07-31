const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// ─── GET budget overview (public) ───
router.get('/overview', (req, res) => {
  try {
    const { fiscal_year } = req.query;
    const year = fiscal_year || new Date().getFullYear().toString();

    const categories = db.prepare(
      `SELECT bc.*, ba.allocated_amount, ba.spent_amount, ba.id as allocation_id
       FROM budget_categories bc
       LEFT JOIN budget_allocations ba ON bc.id = ba.category_id AND ba.fiscal_year = ?
       WHERE bc.fiscal_year = ?
       ORDER BY ba.allocated_amount DESC`
    ).all(year, year);

    const totalAllocated = categories.reduce((sum, c) => sum + (c.allocated_amount || 0), 0);
    const totalSpent = categories.reduce((sum, c) => sum + (c.spent_amount || 0), 0);

    res.json({
      fiscal_year: year,
      total_allocated: totalAllocated,
      total_spent: totalSpent,
      utilization_rate: totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0,
      categories,
    });
  } catch (err) {
    console.error('Budget overview error:', err);
    res.status(500).json({ error: 'Failed to fetch budget overview.' });
  }
});

// ─── GET expenditures for a category ───
router.get('/expenditures/:allocationId', (req, res) => {
  try {
    const expenditures = db.prepare(
      `SELECT be.*, u.full_name as admin_name
       FROM budget_expenditures be
       JOIN users u ON be.admin_id = u.id
       WHERE be.allocation_id = ?
       ORDER BY be.date_spent DESC`
    ).all(req.params.allocationId);
    res.json(expenditures);
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── GET available fiscal years ───
router.get('/years', (req, res) => {
  try {
    const years = db.prepare('SELECT DISTINCT fiscal_year FROM budget_categories ORDER BY fiscal_year DESC').all();
    res.json(years.map(y => y.fiscal_year));
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Create budget category ───
router.post('/categories', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description, color_hex, fiscal_year, allocated_amount } = req.body;
    if (!name || !fiscal_year) return res.status(400).json({ error: 'Name and fiscal year required.' });

    const result = db.prepare(
      'INSERT INTO budget_categories (name, description, color_hex, fiscal_year) VALUES (?, ?, ?, ?)'
    ).run(name, description || '', color_hex || '#F59E0B', fiscal_year);

    // Auto-create allocation record
    db.prepare(
      'INSERT INTO budget_allocations (category_id, allocated_amount, spent_amount, fiscal_year) VALUES (?, ?, 0, ?)'
    ).run(result.lastInsertRowid, allocated_amount || 0, fiscal_year);

    res.status(201).json({ message: 'Category created.', id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Update allocation ───
router.put('/allocations/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { allocated_amount } = req.body;
    db.prepare(
      'UPDATE budget_allocations SET allocated_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(allocated_amount, req.params.id);
    res.json({ message: 'Allocation updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

// ─── ADMIN: Record expenditure ───
router.post('/expenditures', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { allocation_id, amount, description, receipt_url, date_spent } = req.body;
    if (!allocation_id || !amount || !description) {
      return res.status(400).json({ error: 'Allocation, amount, and description required.' });
    }

    db.prepare(
      'INSERT INTO budget_expenditures (allocation_id, admin_id, amount, description, receipt_url, date_spent) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(allocation_id, req.user.id, amount, description, receipt_url || null, date_spent || new Date().toISOString());

    // Update spent_amount in allocation
    db.prepare(
      'UPDATE budget_allocations SET spent_amount = spent_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(amount, allocation_id);

    res.status(201).json({ message: 'Expenditure recorded.' });
  } catch (err) {
    console.error('Expenditure error:', err);
    res.status(500).json({ error: 'Failed.' });
  }
});

module.exports = router;
