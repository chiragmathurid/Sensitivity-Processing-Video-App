const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
const connectDB  = require('./config/db');

dotenv.config(); // load .env variables FIRST before anything else reads them
connectDB();     // connect to MongoDB

const app    = express();
const server = http.createServer(app); // wrap express in http.Server for Socket.io

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
  // 5173 is Vite's default port — this allows the frontend to connect
});

// Make `io` available inside route controllers later
app.set('io', io);

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());                             // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));     // parse form data

// Serve uploaded video files as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (you'll add more here as you build each phase)
// app.use('/api/auth',   require('./routes/authRoutes'));
// app.use('/api/videos', require('./routes/videoRoutes'));

// Health check — visit http://localhost:5000/api/health to confirm it's running
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', time: new Date() });
});

// Socket.io connection (Phase 5 will expand this)
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));