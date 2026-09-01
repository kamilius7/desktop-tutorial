const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/stats
router.get('/stats', authenticate, requireAdmin, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans').get().count;
    const totalEnrollments = db.prepare('SELECT COUNT(*) as count FROM enrollments').get().count;
    const totalDownloads = db.prepare('SELECT COALESCE(SUM(downloads), 0) as count FROM notes').get().count;

    // Recent users (last 7 days)
    const recentUsers = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
    ).get().count;

    // Recent notes (last 7 days)
    const recentNotes = db.prepare(
      "SELECT COUNT(*) as count FROM notes WHERE created_at >= datetime('now', '-7 days')"
    ).get().count;

    // Most active users (by note count)
    const topContributors = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.department, COUNT(n.id) as note_count
      FROM users u
      LEFT JOIN notes n ON u.id = n.author_id
      GROUP BY u.id
      ORDER BY note_count DESC
      LIMIT 5
    `).all();

    // Most popular courses
    const topCourses = db.prepare(`
      SELECT c.id, c.code, c.title, c.color,
        (SELECT COUNT(*) FROM notes WHERE course_id = c.id) as note_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
      FROM courses c
      ORDER BY enrollment_count DESC
      LIMIT 5
    `).all();

    // Notes per department
    const notesByDepartment = db.prepare(`
      SELECT c.department, COUNT(n.id) as count
      FROM notes n
      JOIN courses c ON n.course_id = c.id
      GROUP BY c.department
      ORDER BY count DESC
    `).all();

    res.json({
      totalUsers,
      totalNotes,
      totalCourses,
      totalMessages,
      totalScans,
      totalEnrollments,
      totalDownloads,
      recentUsers,
      recentNotes,
      topContributors,
      topCourses,
      notesByDepartment,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/overview (for any user)
router.get('/overview', authenticate, (req, res) => {
  try {
    const myNotes = db.prepare('SELECT COUNT(*) as count FROM notes WHERE author_id = ?').get(req.user.id).count;
    const myEnrollments = db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?').get(req.user.id).count;
    const myMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE sender_id = ?').get(req.user.id).count;
    const myScans = db.prepare('SELECT COUNT(*) as count FROM scans WHERE user_id = ?').get(req.user.id).count;
    const myDownloads = db.prepare('SELECT COALESCE(SUM(downloads), 0) as count FROM notes WHERE author_id = ?').get(req.user.id).count;

    // Recent activity
    const recentNotes = db.prepare(`
      SELECT n.id, n.title, n.created_at, c.title as course_title, c.color as course_color
      FROM notes n JOIN courses c ON n.course_id = c.id
      WHERE n.author_id = ? ORDER BY n.created_at DESC LIMIT 5
    `).all(req.user.id);

    const recentMessages = db.prepare(`
      SELECT m.content, m.created_at, cr.name as room_name
      FROM messages m JOIN chat_rooms cr ON m.room_id = cr.id
      WHERE m.sender_id = ? ORDER BY m.created_at DESC LIMIT 5
    `).all(req.user.id);

    res.json({
      myNotes,
      myEnrollments,
      myMessages,
      myScans,
      myDownloads,
      recentNotes,
      recentMessages,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

module.exports = router;
