const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io Middleware for JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('--- SOCKET AUTH FAILED: No token ---');
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    socket.user = decoded;
    next();
  } catch (err) {
    console.log('--- SOCKET AUTH FAILED: Invalid token ---');
    next(new Error("Authentication error"));
  }
});

// Import socket handlers
const registerChatHandlers = require('./socket/chatHandlers');

io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.user.id} (${socket.user.role})`);
  registerChatHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected from socket: ${socket.user.id}`);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/plagiarism', require('./routes/plagiarism'));
app.use('/api/chat', require('./routes/chat'));

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('--- GLOBAL ERROR CAUGHT ---');
  console.error('URL:', req.method, req.originalUrl);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);

  // Specific handler for Multer errors
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({
      message: 'File upload error',
      error: err.code,
      field: err.field
    });
  }

  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





