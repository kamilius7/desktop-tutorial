const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (admin)
router.get('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { search, role } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department, u.level, u.created_at,
        (SELECT COUNT(*) FROM notes WHERE author_id = u.id) as note_count,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as message_count
      FROM users u
    `;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/role (admin)
router.put('/:id/role', authenticate, requireAdmin, (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    const updated = db.prepare('SELECT id, name, email, role, department, level, created_at FROM users WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/users/:id (admin)
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
