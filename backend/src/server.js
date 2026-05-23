const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const multer = require('multer');

dotenv.config(); // load .env variables FIRST before anything else reads them
connectDB();     // connect to MongoDB

const app = express();
const server = http.createServer(app); // wrap express in http.Server for Socket.io

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
  // 5173 is Vite's default port — this allows the frontend to connect
});

// Make `io` available inside route controllers later
app.set('io', io);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());                             // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));     // parse form data
app.use('/api/auth', authRoutes);

// Serve uploaded video files as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes (you'll add more here as you build each phase)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));

// Health check — visit http://localhost:8000/api/health to confirm it's running
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', time: new Date() });
});

// Socket.io connection 
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // When a user logs in on the frontend, they join their own private room
  // The room name is simply their MongoDB user ID
  socket.on('join:room', (userId) => {
    socket.join(userId); // join a room named after this user's ID
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;

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

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));