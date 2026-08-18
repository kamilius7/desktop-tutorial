const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `scan-${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// GET /api/scans
router.get('/', authenticate, (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT s.*, u.name as user_name FROM scans s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?';
    const params = [req.user.id];

    if (type) {
      query += ' AND s.type = ?';
      params.push(type);
    }

    query += ' ORDER BY s.created_at DESC';
    const scans = db.prepare(query).all(...params);
    res.json(scans);
  } catch (err) {
    console.error('Get scans error:', err);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

// POST /api/scans
router.post('/', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { title, type } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const file_url = `/uploads/${req.file.filename}`;
    const result = db.prepare(
      'INSERT INTO scans (user_id, title, file_url, type) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, title, file_url, type || 'notes');

    const scan = db.prepare('SELECT s.*, u.name as user_name FROM scans s JOIN users u ON s.user_id = u.id WHERE s.id = ?').get(result.lastInsertRowid);
    res.status(201).json(scan);
  } catch (err) {
    console.error('Create scan error:', err);
    res.status(500).json({ error: 'Failed to save scan' });
  }
});

// DELETE /api/scans/:id
router.delete('/:id', authenticate, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    db.prepare('DELETE FROM scans WHERE id = ?').run(req.params.id);
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    console.error('Delete scan error:', err);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

module.exports = router;
