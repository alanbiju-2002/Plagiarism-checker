const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure Multer for Chat Uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'chat');
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `chat-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload file for chat
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = req.file.path.replace(/\\/g, '/');
    res.json({ 
        url: fileUrl,
        fileName: req.file.originalname 
    });
});

// Get chat history for a room
router.get('/history/:roomId', authenticate, async (req, res) => {
    try {
        const { roomId } = req.params;
        let query;
        let params;

        if (roomId.startsWith('class_')) {
            const classId = roomId.replace('class_', '');
            query = `SELECT m.*, u.full_name as sender_name 
                     FROM messages m 
                     JOIN users u ON m.sender_id = u.id 
                     WHERE m.class_id = ? 
                     ORDER BY m.created_at ASC`;
            params = [classId];
        } else if (roomId.startsWith('dm_')) {
            const ids = roomId.replace('dm_', '').split('_');
            query = `SELECT m.*, u.full_name as sender_name 
                     FROM messages m 
                     JOIN users u ON m.sender_id = u.id 
                     WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                        OR (m.sender_id = ? AND m.receiver_id = ?)
                     ORDER BY m.created_at ASC`;
            params = [ids[0], ids[1], ids[1], ids[0]];
        } else {
            return res.status(400).json({ message: 'Invalid room ID' });
        }

        const [messages] = await pool.execute(query, params);
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unread counts
router.get('/unread', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const [unread] = await pool.execute(
            `SELECT sender_id, COUNT(*) as count 
             FROM messages 
             WHERE receiver_id = ? AND is_read = FALSE 
             GROUP BY sender_id`,
            [userId]
        );
        res.json({ unread });
    } catch (error) {
        console.error('Error fetching unread counts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available contacts (Teachers for student, Students for teacher)
router.get('/contacts', authenticate, async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        let contacts = [];

        if (role === 'student') {
            // Students can message teachers of their classes
            const [teachers] = await pool.execute(
                `SELECT DISTINCT u.id, u.full_name, u.email, u.role
                 FROM class_students cs
                 JOIN classes c ON cs.class_id = c.id
                 JOIN users u ON c.teacher_id = u.id
                 WHERE cs.student_id = ?`,
                [userId]
            );
            
            const [classes] = await pool.execute(
                `SELECT c.id, c.class_name as full_name, 'class' as role 
                 FROM class_students cs 
                 JOIN classes c ON cs.class_id = c.id 
                 WHERE cs.student_id = ?`,
                [userId]
            );
            
            contacts = [...classes, ...teachers];
        } else if (role === 'teacher') {
            // Teachers can message students and their classes
            const [students] = await pool.execute(
                `SELECT DISTINCT u.id, u.full_name, u.email, u.role
                 FROM classes c
                 JOIN class_students cs ON c.id = cs.class_id
                 JOIN users u ON cs.student_id = u.id
                 WHERE c.teacher_id = ?`,
                [userId]
            );
            
            const [classes] = await pool.execute(
                `SELECT id, class_name as full_name, 'class' as role 
                 FROM classes 
                 WHERE teacher_id = ?`,
                [userId]
            );
            contacts = [...classes, ...students];
        }

        res.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
