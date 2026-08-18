const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `note-${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/notes
router.get('/', authenticate, (req, res) => {
  try {
    const { course_id, search, tag } = req.query;
    let query = `
      SELECT n.*, u.name as author_name, u.avatar as author_avatar, c.title as course_title, c.code as course_code, c.color as course_color
      FROM notes n
      JOIN users u ON n.author_id = u.id
      JOIN courses c ON n.course_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (course_id) {
      conditions.push('n.course_id = ?');
      params.push(course_id);
    }
    if (search) {
      conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tag) {
      conditions.push('n.tags LIKE ?');
      params.push(`%${tag}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY n.created_at DESC';

    const notes = db.prepare(query).all(...params);
    // Parse tags JSON
    const parsed = notes.map(n => ({ ...n, tags: JSON.parse(n.tags || '[]') }));
    res.json(parsed);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const note = db.prepare(`
      SELECT n.*, u.name as author_name, u.avatar as author_avatar, c.title as course_title, c.code as course_code, c.color as course_color
      FROM notes n
      JOIN users u ON n.author_id = u.id
      JOIN courses c ON n.course_id = c.id
      WHERE n.id = ?
    `).get(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.tags = JSON.parse(note.tags || '[]');
    res.json(note);
  } catch (err) {
    console.error('Get note error:', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes
router.post('/', authenticate, upload.single('file'), (req, res) => {
  try {
    const { title, content, course_id, tags } = req.body;
    if (!title || !course_id) {
      return res.status(400).json({ error: 'Title and course are required' });
    }

    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const tagsJson = tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : '[]';

    const result = db.prepare(
      'INSERT INTO notes (title, content, file_url, course_id, author_id, tags) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, content || '', file_url, course_id, req.user.id, tagsJson);

    const note = db.prepare(`
      SELECT n.*, u.name as author_name, u.avatar as author_avatar, c.title as course_title, c.code as course_code, c.color as course_color
      FROM notes n
      JOIN users u ON n.author_id = u.id
      JOIN courses c ON n.course_id = c.id
      WHERE n.id = ?
    `).get(result.lastInsertRowid);

    note.tags = JSON.parse(note.tags || '[]');
    res.status(201).json(note);
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id
router.put('/:id', authenticate, upload.single('file'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, content, course_id, tags } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : existing.file_url;
    const tagsJson = tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : existing.tags;

    db.prepare(
      'UPDATE notes SET title = ?, content = ?, file_url = ?, course_id = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      title || existing.title,
      content !== undefined ? content : existing.content,
      file_url,
      course_id || existing.course_id,
      tagsJson,
      req.params.id
    );

    const note = db.prepare(`
      SELECT n.*, u.name as author_name, u.avatar as author_avatar, c.title as course_title, c.code as course_code, c.color as course_color
      FROM notes n
      JOIN users u ON n.author_id = u.id
      JOIN courses c ON n.course_id = c.id
      WHERE n.id = ?
    `).get(req.params.id);

    note.tags = JSON.parse(note.tags || '[]');
    res.json(note);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', authenticate, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }
    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST /api/notes/:id/download
router.post('/:id/download', authenticate, (req, res) => {
  try {
    db.prepare('UPDATE notes SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
    const note = db.prepare('SELECT downloads FROM notes WHERE id = ?').get(req.params.id);
    res.json({ downloads: note.downloads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track download' });
  }
});

module.exports = router;
