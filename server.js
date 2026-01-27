const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database check
const pool = require('./config/database');
pool.query('SELECT 1').then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/plagiarism', require('./routes/plagiarism'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Catch-all for unmatched API routes
app.use('/api', (req, res) => {
  console.log(`404 - API Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




