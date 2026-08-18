const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/rooms
router.get('/rooms', authenticate, (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT cr.*, 
        c.title as course_title, c.code as course_code, c.color as course_color,
        (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count,
        (SELECT content FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT u.name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.room_id = cr.id ORDER BY m.created_at DESC LIMIT 1) as last_sender
      FROM chat_rooms cr
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE cr.id IN (SELECT room_id FROM room_members WHERE user_id = ?)
      ORDER BY last_message_at DESC, cr.created_at DESC
    `).all(req.user.id);
    res.json(rooms);
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/chat/rooms/:id
router.get('/rooms/:id', authenticate, (req, res) => {
  try {
    const membership = db.prepare('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const room = db.prepare(`
      SELECT cr.*, c.title as course_title, c.code as course_code, c.color as course_color
      FROM chat_rooms cr
      LEFT JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ?
    `).get(req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get members
    room.members = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.department
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ?
    `).all(room.id);

    res.json(room);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST /api/chat/rooms
router.post('/rooms', authenticate, (req, res) => {
  try {
    const { name, type, course_id, member_ids } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const result = db.prepare(
      'INSERT INTO chat_rooms (name, type, course_id) VALUES (?, ?, ?)'
    ).run(name, type || 'group', course_id || null);

    // Add creator as member
    db.prepare('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, req.user.id);

    // Add other members if provided
    if (member_ids && Array.isArray(member_ids)) {
      const insertMember = db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)');
      for (const uid of member_ids) {
        insertMember.run(result.lastInsertRowid, uid);
      }
    }

    const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET /api/chat/rooms/:id/messages
router.get('/rooms/:id/messages', authenticate, (req, res) => {
  try {
    const membership = db.prepare('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const { before, limit = 50 } = req.query;
    let query = `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
    `;
    const params = [req.params.id];

    if (before) {
      query += ' AND m.id < ?';
      params.push(before);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const messages = db.prepare(query).all(...params);
    res.json(messages.reverse());
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chat/rooms/:id/messages
router.post('/rooms/:id/messages', authenticate, (req, res) => {
  try {
    const membership = db.prepare('SELECT id FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = db.prepare(
      'INSERT INTO messages (sender_id, room_id, content) VALUES (?, ?, ?)'
    ).run(req.user.id, req.params.id, content.trim());

    const message = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/chat/rooms/:id/join
router.post('/rooms/:id/join', authenticate, (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)').run(room.id, req.user.id);
    res.json({ joined: true });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

module.exports = router;
