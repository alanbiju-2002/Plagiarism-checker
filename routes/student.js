const express = require('express');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require student authentication
router.use(authenticate);
router.use(authorize('student'));

// Get student's classes
router.get('/classes', async (req, res) => {
  try {
    const student_id = req.user.id;

    const [classes] = await pool.execute(
      `SELECT c.*, u.full_name as teacher_name
       FROM class_students cs
       JOIN classes c ON cs.class_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE cs.student_id = ?
       ORDER BY c.created_at DESC`,
      [student_id]
    );

    res.json({ classes });
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join class by code
router.post('/classes/join', async (req, res) => {
  const { class_code } = req.body;
  console.log('--- STUDENT JOIN CLASS ATTEMPTED ---');
  console.log(`Received Code: [${class_code}]`);
  try {
    const student_id = req.user.id;

    if (!class_code) {
      return res.status(400).json({ message: 'Class code is required' });
    }

    // Find class by code
    const [classes] = await pool.execute(
      'SELECT id FROM classes WHERE class_code = ?',
      [class_code]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const class_id = classes[0].id;

    // Add student to class
    try {
      await pool.execute(
        'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
        [class_id, student_id]
      );

      res.json({ message: 'Joined class successfully' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Already in this class' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignments for a class
router.get('/classes/:classId/assignments', async (req, res) => {
  try {
    const { classId } = req.params;
    const student_id = req.user.id;

    // Verify student is in the class
    const [enrollment] = await pool.execute(
      'SELECT * FROM class_students WHERE class_id = ? AND student_id = ?',
      [classId, student_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this class' });
    }

    const [assignments] = await pool.execute(
      `SELECT a.*, 
       (SELECT status FROM submissions WHERE assignment_id = a.id AND student_id = ?) as submission_status,
       (SELECT similarity_score FROM submissions WHERE assignment_id = a.id AND student_id = ?) as similarity_score
       FROM assignments a
       WHERE a.class_id = ?
       ORDER BY a.created_at DESC`,
      [student_id, student_id, classId]
    );

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's submissions
router.get('/submissions', async (req, res) => {
  try {
    const student_id = req.user.id;

    const [submissions] = await pool.execute(
      `SELECT s.*, a.title as assignment_title, a.class_id, c.class_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE s.student_id = ?
       ORDER BY s.submitted_at DESC`,
      [student_id]
    );

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission details with score
router.get('/submissions/:submissionId', async (req, res) => {
  console.log(`--- GET SUBMISSION DETAILS ATTEMPTED: ${req.params.submissionId} ---`);
  try {
    const { submissionId } = req.params;
    const student_id = req.user.id;

    const [submissions] = await pool.execute(
      `SELECT s.*, a.title as assignment_title, c.class_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE s.id = ? AND s.student_id = ?`,
      [submissionId, student_id]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Get plagiarism matches
    const [matches] = await pool.execute(
      `SELECT pm.*, 
       u.full_name as matched_student_name,
       es.title as external_source_title
       FROM plagiarism_matches pm
       LEFT JOIN submissions s2 ON pm.matched_submission_id = s2.id
       LEFT JOIN users u ON s2.student_id = u.id
       LEFT JOIN external_sources es ON pm.matched_source_type = 'external'
       WHERE pm.submission_id = ?
       ORDER BY pm.similarity_percentage DESC`,
      [submissionId]
    );

    res.json({
      submission: submissions[0],
      matches: matches
    });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




