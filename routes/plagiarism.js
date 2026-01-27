const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const fileService = require('../services/fileService');
const plagiarismService = require('../services/plagiarismService');

const router = express.Router();

// Ensure upload directory exists
fileService.ensureUploadDir();

// Configure multer for external source uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const externalPath = path.join(uploadPath, 'external');
    await fs.mkdir(externalPath, { recursive: true });
    cb(null, externalPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `external-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
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

// Upload external source (admin/teacher only)
router.post('/external-sources', authenticate, authorize('admin', 'teacher'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Title is required' });
    }

    // Extract text from file
    let extractedText = '';
    try {
      extractedText = await fileService.extractText(req.file.path, req.file.mimetype);
    } catch (error) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: error.message });
    }

    // Save external source
    const [result] = await pool.execute(
      `INSERT INTO external_sources (title, file_path, extracted_text, uploaded_by)
       VALUES (?, ?, ?, ?)`,
      [title, req.file.path, extractedText, req.user.id]
    );

    res.status(201).json({
      message: 'External source uploaded successfully',
      sourceId: result.insertId
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    console.error('Error uploading external source:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get external sources
router.get('/external-sources', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const [sources] = await pool.execute(
      `SELECT id, title, uploaded_by, created_at
       FROM external_sources
       ORDER BY created_at DESC`
    );

    res.json({ sources });
  } catch (error) {
    console.error('Error fetching external sources:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Re-check submission for plagiarism
router.post('/recheck/:submissionId', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Get submission
    const [submissions] = await pool.execute(
      'SELECT * FROM submissions WHERE id = ?',
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const submission = submissions[0];

    // Delete existing matches
    await pool.execute('DELETE FROM plagiarism_matches WHERE submission_id = ?', [submissionId]);

    // Re-check plagiarism
    const result = await plagiarismService.performPlagiarismCheck(
      submissionId,
      submission.assignment_id,
      submission.extracted_text
    );

    res.json({
      message: 'Plagiarism check completed',
      result: result
    });
  } catch (error) {
    console.error('Error rechecking plagiarism:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




