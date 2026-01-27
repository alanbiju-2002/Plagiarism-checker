const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // secure filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Register new user with profile picture
router.post('/register', upload.single('profile_picture'), [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  body('roll_number').optional().trim()
], async (req, res) => {
  try {
    // If there are validation errors, we should delete the uploaded file to avoid clutter
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, full_name, role, roll_number } = req.body;
    const profile_picture = req.file ? req.file.filename : null;

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (status pending for teacher and student, approved for admin)
    const status = role === 'admin' ? 'approved' : 'pending';
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, hashed_password, full_name, role, status, roll_number, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, role, status, roll_number || null, profile_picture]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
      status: status
    });
  } catch (error) {
    if (req.file) {
      // Cleanup file if DB insert fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Failed to delete file after error", err);
      }
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if approved (handle both fields for compatibility)
    if (user.status !== 'approved' && user.is_approved !== 1) {
      return res.status(403).json({
        message: `Account is ${user.status || 'pending'}. Please wait for admin approval.`
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        roll_number: user.roll_number,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, role, status, roll_number, profile_picture FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/update', authenticate, upload.single('profile_picture'), [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roll_number').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, email, password, roll_number } = req.body;
    const userId = req.user.id;

    // Get current user to check for changes and handle old profile pic
    const [currentUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (currentUsers.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }
    const currentUser = currentUsers[0];

    // Check email uniqueness if changed
    if (email && email !== currentUser.email) {
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existing.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    let updates = [];
    let values = [];

    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (roll_number && currentUser.role === 'student') {
      updates.push('roll_number = ?');
      values.push(roll_number);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('hashed_password = ?');
      values.push(hashedPassword);
    }
    if (req.file) {
      updates.push('profile_picture = ?');
      values.push(req.file.filename);

      // Delete old profile picture
      if (currentUser.profile_picture) {
        const oldPath = path.join(__dirname, '../uploads', currentUser.profile_picture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    if (updates.length > 0) {
      values.push(userId);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Fetch updated user
    const [updatedUsers] = await pool.execute(
      'SELECT id, username, email, full_name, role, status, roll_number, profile_picture FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUsers[0]
    });

  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { }
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




