const express = require('express');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, email, full_name, role, status, created_at 
       FROM users 
       WHERE status = 'pending' 
       ORDER BY created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve user
router.post('/approve-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['approved', userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject user
router.post('/reject-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['rejected', userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, username, email, full_name, role, status, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all scores/reports
router.get('/scores', async (req, res) => {
  try {
    const [scores] = await pool.execute(
      `SELECT 
        s.id,
        s.similarity_score,
        s.status,
        s.submitted_at,
        s.checked_at,
        s.rejection_reason,
        a.title as assignment_title,
        a.class_id,
        c.class_name,
        u.full_name as student_name,
        u.email as student_email
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       JOIN users u ON s.student_id = u.id
       ORDER BY s.submitted_at DESC`
    );

    res.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
        (SELECT COUNT(*) FROM classes) as total_classes,
        (SELECT COUNT(*) FROM assignments) as total_assignments,
        (SELECT COUNT(*) FROM submissions) as total_submissions,
        (SELECT COUNT(*) FROM submissions WHERE status = 'rejected') as rejected_submissions,
        (SELECT AVG(similarity_score) FROM submissions WHERE similarity_score IS NOT NULL) as avg_similarity`
    );

    res.json({ statistics: stats[0] });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId == req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




