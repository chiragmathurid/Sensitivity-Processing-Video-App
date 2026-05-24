const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const multer = require('multer');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Socket.io — uses env variable for production
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

app.set('io', io);

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Body parsers BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ Routes — mounted ONCE each
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', time: new Date() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ✅ Error handler — must be last
app.use((err, req, res, next) => {
  console.error('FULL ERROR:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message && err.message.includes('Only video files')) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));