const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const fileService = require('../services/fileService');
const plagiarismService = require('../services/plagiarismService');

const router = express.Router();

// Ensure upload directory exists
fileService.ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const assignmentPath = path.join(uploadPath, 'assignments');
    await fs.mkdir(assignmentPath, { recursive: true });
    cb(null, assignmentPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOCX, DOC, TXT'));
    }
  }
});

// Upload assignment submission (student only)
router.post('/:assignmentId/submit', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const student_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Verify assignment exists and student is enrolled
    const [assignments] = await pool.execute(
      `SELECT a.*, c.id as class_id
       FROM assignments a
       JOIN classes c ON a.class_id = c.id
       JOIN class_students cs ON c.id = cs.class_id
       WHERE a.id = ? AND cs.student_id = ?`,
      [assignmentId, student_id]
    );

    if (assignments.length === 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: 'Assignment not found or not enrolled' });
    }

    const assignment = assignments[0];
    if (assignment.due_date) {
      const [extensions] = await pool.execute(
        'SELECT extended_until FROM submission_extensions WHERE assignment_id = ? AND student_id = ?',
        [assignmentId, student_id]
      );
      
      const effectiveDeadline = extensions.length > 0 
        ? new Date(extensions[0].extended_until) 
        : new Date(assignment.due_date);

      if (new Date() > effectiveDeadline) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(403).json({ message: 'Submission deadline has passed' });
      }
    }

    // Check if already submitted
    const [existing] = await pool.execute(
      'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, student_id]
    );

    if (existing.length > 0) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Already submitted. Please delete existing submission first.' });
    }

    // Extract text from file
    let extractedText = '';
    try {
      console.log(`Extracting text from: ${req.file.path} (${req.file.mimetype})`);
      extractedText = await fileService.extractText(req.file.path, req.file.mimetype);
      if (!extractedText) {
        console.warn('Warning: Extracted text is empty');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      await fs.unlink(req.file.path).catch(() => { });
      return res.status(400).json({
        message: 'Failed to extract text from document',
        error: error.message
      });
    }

    // Create submission record
    const [result] = await pool.execute(
      `INSERT INTO submissions 
       (assignment_id, student_id, file_path, file_name, file_type, file_size, extracted_text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        assignmentId,
        student_id,
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        extractedText
      ]
    );

    const submissionId = result.insertId;

    // Perform plagiarism check asynchronously
    console.log(`Starting plagiarism check for submission ${submissionId}`);
    plagiarismService.performPlagiarismCheck(submissionId, assignmentId, extractedText)
      .then(result => {
        console.log(`Plagiarism check completed for submission ${submissionId}:`, result.status);
      })
      .catch(error => {
        console.error(`Plagiarism check failed for submission ${submissionId}:`, error);
        // We don't return an error to the user here because the submission 
        // record was already created and the response sent (or about to be sent).
        // The background check failure should be logged for admin investigation.
      });

    res.status(201).json({
      message: 'Assignment submitted successfully. Plagiarism check in progress.',
      submissionId: submissionId
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => { });
    }
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignment details
router.get('/:assignmentId', authenticate, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    let query;
    let params;

    if (user_role === 'student') {
      // Verify student is enrolled
      query = `SELECT a.*, c.class_name, c.class_code,
               (SELECT status FROM submissions WHERE assignment_id = a.id AND student_id = ?) as submission_status
               FROM assignments a
               JOIN classes c ON a.class_id = c.id
               JOIN class_students cs ON c.id = cs.class_id
               WHERE a.id = ? AND cs.student_id = ?`;
      params = [user_id, assignmentId, user_id];
    } else {
      // Teacher or admin
      query = `SELECT a.*, c.class_name, c.class_code
               FROM assignments a
               JOIN classes c ON a.class_id = c.id
               WHERE a.id = ?`;
      params = [assignmentId];
    }

    const [assignments] = await pool.execute(query, params);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ assignment: assignments[0] });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete submission (student only)
router.delete('/submissions/:submissionId', authenticate, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const student_id = req.user.id;

    // Get submission
    const [submissions] = await pool.execute(
      'SELECT * FROM submissions WHERE id = ? AND student_id = ?',
      [submissionId, student_id]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = submissions[0];

    // Delete file
    try {
      await fs.unlink(submission.file_path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete plagiarism matches
    await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [submissionId]);

    // Delete submission
    await pool.execute('DELETE FROM submissions WHERE id = ?', [submissionId]);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;





