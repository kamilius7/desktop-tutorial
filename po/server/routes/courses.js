const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses
router.get('/', authenticate, (req, res) => {
  try {
    const { department, search } = req.query;
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM notes WHERE course_id = c.id) as note_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
      FROM courses c
    `;
    const params = [];
    const conditions = [];

    if (department) {
      conditions.push('c.department = ?');
      params.push(department);
    }
    if (search) {
      conditions.push('(c.title LIKE ? OR c.code LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.department, c.code';
    const courses = db.prepare(query).all(...params);
    res.json(courses);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const course = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM notes WHERE course_id = c.id) as note_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
      FROM courses c WHERE c.id = ?
    `).get(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if current user is enrolled
    const enrolled = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user.id, course.id);
    course.enrolled = !!enrolled;

    // Get recent notes for this course
    course.recent_notes = db.prepare(`
      SELECT n.id, n.title, n.created_at, u.name as author_name
      FROM notes n JOIN users u ON n.author_id = u.id
      WHERE n.course_id = ? ORDER BY n.created_at DESC LIMIT 5
    `).all(course.id);

    res.json(course);
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/courses
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { code, title, department, level, description, color, icon } = req.body;
    if (!code || !title || !department || !level) {
      return res.status(400).json({ error: 'Code, title, department and level are required' });
    }

    const existing = db.prepare('SELECT id FROM courses WHERE code = ?').get(code);
    if (existing) {
      return res.status(409).json({ error: 'Course code already exists' });
    }

    const result = db.prepare(
      'INSERT INTO courses (code, title, department, level, description, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(code, title, department, level, description || '', color || '#1B4332', icon || '📚');

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { title, department, level, description, color, icon } = req.body;
    db.prepare(
      'UPDATE courses SET title = ?, department = ?, level = ?, description = ?, color = ?, icon = ? WHERE id = ?'
    ).run(
      title || existing.title,
      department || existing.department,
      level || existing.level,
      description !== undefined ? description : existing.description,
      color || existing.color,
      icon || existing.icon,
      req.params.id
    );

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }
    db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', authenticate, (req, res) => {
  try {
    const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user.id, course.id);
    if (existing) {
      // Unenroll
      db.prepare('DELETE FROM enrollments WHERE user_id = ? AND course_id = ?').run(req.user.id, course.id);
      return res.json({ enrolled: false });
    }

    db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(req.user.id, course.id);
    res.json({ enrolled: true });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Failed to toggle enrollment' });
  }
});

// GET /api/courses/departments/list
router.get('/departments/list', authenticate, (req, res) => {
  try {
    const depts = db.prepare('SELECT DISTINCT department FROM courses ORDER BY department').all();
    res.json(depts.map(d => d.department));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

module.exports = router;
