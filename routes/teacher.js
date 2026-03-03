const express = require('express');
const XLSX = require('xlsx');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require teacher authentication
router.use(authenticate);
router.use(authorize('teacher', 'admin'));

// Create a class
router.post('/classes', async (req, res) => {
  try {
    const { class_name, class_code, description } = req.body;
    const teacher_id = req.user.id;

    if (!class_name || !class_code) {
      return res.status(400).json({ message: 'Class name and code are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO classes (class_name, class_code, teacher_id, description) VALUES (?, ?, ?, ?)',
      [class_name, class_code, teacher_id, description || null]
    );

    res.status(201).json({
      message: 'Class created successfully',
      classId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Class code already exists' });
    }
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's classes
router.get('/classes', async (req, res) => {
  try {
    const teacher_id = req.user.id;

    const [classes] = await pool.execute(
      `SELECT c.*, 
       (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
       FROM classes c
       WHERE c.teacher_id = ?
       ORDER BY c.created_at DESC`,
      [teacher_id]
    );

    res.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add student to class
router.post('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const { student_id } = req.body;

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT teacher_id FROM classes WHERE id = ?',
      [classId]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classes[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify student exists
    const [students] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ? AND role = ?',
      [student_id, 'student']
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Add student to class
    await pool.execute(
      'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
      [classId, student_id]
    );

    res.json({ message: 'Student added to class successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Student already in class' });
    }
    console.error('Error adding student to class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students in a class
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT teacher_id FROM classes WHERE id = ?',
      [classId]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classes[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [students] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.full_name, u.roll_number, cs.joined_at
       FROM class_students cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.class_id = ?
       ORDER BY u.roll_number, u.full_name`,
      [classId]
    );

    res.json({ students });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment
router.post('/assignments', async (req, res) => {
  try {
    const { title, description, class_id, due_date, max_score } = req.body;
    const teacher_id = req.user.id;

    if (!title || !class_id) {
      return res.status(400).json({ message: 'Title and class ID are required' });
    }

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT teacher_id FROM classes WHERE id = ?',
      [class_id]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classes[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [result] = await pool.execute(
      'INSERT INTO assignments (title, description, class_id, teacher_id, due_date, max_score) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, class_id, teacher_id, due_date || null, max_score || 100]
    );

    res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId: result.insertId
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignments for a class
router.get('/classes/:classId/assignments', async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT teacher_id FROM classes WHERE id = ?',
      [classId]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classes[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [assignments] = await pool.execute(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
       FROM assignments a
       WHERE a.class_id = ?
       ORDER BY a.created_at DESC`,
      [classId]
    );

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for an assignment
router.get('/assignments/:assignmentId/submissions', async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Verify teacher owns the assignment
    const [assignments] = await pool.execute(
      'SELECT teacher_id FROM assignments WHERE id = ?',
      [assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignments[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [submissions] = await pool.execute(
      `SELECT s.*, u.full_name as student_name, u.email as student_email, u.roll_number as student_roll_number
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = ?
       ORDER BY u.roll_number, u.full_name`,
      [assignmentId]
    );

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submission details with score (for teachers)
router.get('/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const teacher_id = req.user.id;

    // Verify teacher owns the class of this submission
    const [submissions] = await pool.execute(
      `SELECT s.*, u.full_name as student_name, u.email as student_email, u.roll_number as student_roll_number,
              a.title as assignment_title, c.class_name
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = submissions[0];

    // Check ownership (must be the teacher of the class or admin)
    const [classes] = await pool.execute(
      'SELECT teacher_id FROM classes WHERE id = (SELECT class_id FROM assignments WHERE id = ?)',
      [submission.assignment_id]
    );

    if (classes.length === 0 || (classes[0].teacher_id !== teacher_id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
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
      submission: submission,
      matches: matches
    });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all submissions for a specific class
router.delete('/classes/:classId/submissions/clear', async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher_id = req.user.id;

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT id FROM classes WHERE id = ? AND (teacher_id = ? OR ? = "admin")',
      [classId, teacher_id, req.user.role]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    // Get all submissions to delete files
    const [submissions] = await pool.execute(
      `SELECT s.id, s.file_path FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.class_id = ?`,
      [classId]
    );

    // Delete files
    const fs = require('fs').promises;
    for (const sub of submissions) {
      if (sub.file_path) {
        await fs.unlink(sub.file_path).catch(err => console.error(`Failed to delete file ${sub.file_path}:`, err));
      }
      // Delete matches first due to foreign key constraints if any
      await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [sub.id]);
    }

    // Delete submissions
    await pool.execute(
      `DELETE s FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.class_id = ?`,
      [classId]
    );

    res.json({ message: `Successfully cleared ${submissions.length} submissions for the class.` });
  } catch (error) {
    console.error('Error clearing class submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all submissions for all classes owned by the teacher
router.delete('/submissions/all/clear', async (req, res) => {
  try {
    const teacher_id = req.user.id;

    // Get all submissions for all classes owned by this teacher
    const [submissions] = await pool.execute(
      `SELECT s.id, s.file_path FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE c.teacher_id = ? OR ? = "admin"`,
      [teacher_id, req.user.role]
    );

    // Delete files and matches
    const fs = require('fs').promises;
    for (const sub of submissions) {
      if (sub.file_path) {
        await fs.unlink(sub.file_path).catch(err => console.error(`Failed to delete file ${sub.file_path}:`, err));
      }
      await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [sub.id]);
    }

    // Delete submissions
    if (submissions.length > 0) {
      const submissionIds = submissions.map(s => s.id);
      await pool.query('DELETE FROM submissions WHERE id IN (?)', [submissionIds]);
    }

    res.json({ message: `Successfully cleared ${submissions.length} submissions across all your classes.` });
  } catch (error) {
    console.error('Error clearing all submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update score for a submission
router.post('/submissions/:submissionId/score', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score } = req.body;
    const teacher_id = req.user.id;

    // Verify teacher owns the class of this submission
    const [submissions] = await pool.execute(
      `SELECT s.id, a.teacher_id FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submissions[0].teacher_id !== teacher_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await pool.execute(
      'UPDATE submissions SET score = ? WHERE id = ?',
      [score, submissionId]
    );

    res.json({ message: 'Score updated successfully', score });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status for a submission (Accept/Reject)
router.post('/submissions/:submissionId/status', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, rejection_reason } = req.body;
    const teacher_id = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted or rejected.' });
    }

    // Verify teacher owns the class of this submission
    const [submissions] = await pool.execute(
      `SELECT s.id, a.teacher_id FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submissions[0].teacher_id !== teacher_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reason = status === 'rejected' ? rejection_reason : null;

    await pool.execute(
      'UPDATE submissions SET status = ?, rejection_reason = ? WHERE id = ?',
      [status, reason, submissionId]
    );

    res.json({ message: `Submission ${status} successfully`, status });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a student's roll number manually
router.put('/students/:studentId/roll-number', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { roll_number } = req.body;
    const teacher_id = req.user.id;

    // Verify teacher has this student in one of their classes
    const [enrollment] = await pool.execute(
      `SELECT cs.id FROM class_students cs
       JOIN classes c ON cs.class_id = c.id
       WHERE cs.student_id = ? AND (c.teacher_id = ? OR ? = "admin")`,
      [studentId, teacher_id, req.user.role]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Access denied or student not enrolled in your classes' });
    }

    await pool.execute(
      'UPDATE users SET roll_number = ? WHERE id = ?',
      [roll_number, studentId]
    );

    res.json({ message: 'Roll number updated successfully', roll_number });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Roll number already exists' });
    }
    console.error('Error updating roll number:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-assign roll numbers for a class based on alphabetical name order
router.post('/classes/:classId/auto-assign-rolls', async (req, res) => {
  try {
    const { classId } = req.params;
    const { prefix = 'ROLL' } = req.body;
    const teacher_id = req.user.id;

    // Verify teacher owns the class
    const [classes] = await pool.execute(
      'SELECT id FROM classes WHERE id = ? AND (teacher_id = ? OR ? = "admin")',
      [classId, teacher_id, req.user.role]
    );

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    // Get all students in the class ordered by name
    const [students] = await pool.execute(
      `SELECT u.id, u.full_name 
       FROM class_students cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.class_id = ?
       ORDER BY u.full_name ASC`,
      [classId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in this class' });
    }

    // Update each student with a roll number
    // We'll use a transaction or just simple updates
    for (let i = 0; i < students.length; i++) {
      const rollNo = `${prefix}${(i + 1).toString().padStart(3, '0')}`;
      await pool.execute(
        'UPDATE users SET roll_number = ? WHERE id = ?',
        [rollNo, students[i].id]
      );
    }

    res.json({ message: `Successfully assigned roll numbers to ${students.length} students.` });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Conflict detected. Some students might already have these roll numbers. Please use a different prefix.' });
    }
    console.error('Error auto-assigning roll numbers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export scores for an assignment to Excel
router.get('/assignments/:assignmentId/export', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacher_id = req.user.id;

    // Verify teacher owns the assignment
    const [assignments] = await pool.execute(
      'SELECT title FROM assignments WHERE id = ? AND (teacher_id = ? OR ? = "admin")',
      [assignmentId, teacher_id, req.user.role]
    );

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    const assignmentTitle = assignments[0].title;

    // Get all students and их submissions
    const [data] = await pool.execute(
      `SELECT u.roll_number, u.full_name, s.score, s.similarity_score, s.plagiarism_score, s.originality_score, s.status, s.submitted_at
       FROM users u
       JOIN class_students cs ON u.id = cs.student_id
       JOIN assignments a ON cs.class_id = a.class_id
       LEFT JOIN submissions s ON (u.id = s.student_id AND s.assignment_id = a.id)
       WHERE a.id = ?
       ORDER BY u.roll_number, u.full_name`,
      [assignmentId]
    );

    // Format data for Excel
    const worksheetData = data.map(row => ({
      'Roll Number': row.roll_number || 'N/A',
      'Student Name': row.full_name,
      'Score': row.score !== null ? row.score : 'Not Graded',
      'Similarity %': row.similarity_score != null ? row.similarity_score : 'N/A',
      'Plagiarism %': row.plagiarism_score != null ? row.plagiarism_score : 'N/A',
      'Originality %': row.originality_score != null ? row.originality_score : 'N/A',
      'Status': row.status || 'Not Submitted',
      'Submitted At': row.submitted_at ? new Date(row.submitted_at).toLocaleString() : 'N/A'
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Scores_${assignmentTitle.replace(/\s+/g, '_')}.xlsx"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting scores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





