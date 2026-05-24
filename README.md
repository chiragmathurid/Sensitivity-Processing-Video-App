# 🎬 Video Upload & Sensitivity Processing App

A full-stack web application for uploading videos, processing them for content
sensitivity analysis, and streaming them back — with real-time progress tracking.

---

## 🔗 Live Links

- **App (Frontend):** https://videoapp-frontend-phi.vercel.app
- **API (Backend):** https://videoapp-backend-v96w.onrender.com
- **Video Demonstration:** https://drive.google.com/file/d/1hS-ZRYgKOC82Dh4BjcNkmMPuSSkiZS2e/view?usp=sharing

> Note: The backend is on Render's free tier and may take ~30 seconds to wake up
> after inactivity. Please wait and refresh if the first load is slow.

---

## ✨ Features

- 🔐 JWT Authentication (register / login / logout)
- 👥 Role-Based Access Control — Viewer, Editor, Admin
- 📤 Video upload with file type & size validation
- 🔍 Automated sensitivity analysis (safe / flagged classification)
- 📡 Real-time processing progress via Socket.io
- 🎥 Video streaming with HTTP Range Requests
- 📚 Video library with search and status filtering
- 🏢 Multi-tenant — each user only sees their own videos

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Frontend | React + Vite |
| Real-Time | Socket.io |
| Authentication | JWT + bcryptjs |
| File Uploads | Multer |
| Video Processing | FFmpeg (ffprobe) |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Database Hosting | MongoDB Atlas |

---

## 📁 Project Structure
my-app/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # authController.js, videoController.js
│   ├── middleware/      # auth.js (protect + requireRole)
│   ├── models/          # User.js, Video.js
│   ├── routes/          # authRoutes.js, videoRoutes.js
│   ├── uploads/         # local video storage (gitignored)
│   └── server.js
└── frontend/
└── src/
├── api/         # axios.js (configured instance)
├── components/  # Navbar.jsx, ProtectedRoute.jsx
├── context/     # AuthContext.jsx
└── pages/       # Login, Register, Dashboard,

# VideoLibrary, VideoPlayer
---

## ⚙️ Local Setup Guide

### Prerequisites
- Node.js LTS installed
- MongoDB Atlas account (or local MongoDB)
- FFmpeg installed on your machine

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd my-app
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173`

---

## 🔑 API Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | Register a new user |
| POST | `/api/auth/login` | No | — | Login |
| GET | `/api/videos` | Yes | Any | List your videos |
| POST | `/api/videos/upload` | Yes | Editor, Admin | Upload a video |
| GET | `/api/videos/stream/:id` | Yes | Any | Stream a video |
| DELETE | `/api/videos/:id` | Yes | Admin | Delete a video |

---

## 👥 User Roles

| Role | What they can do |
|---|---|
| **Viewer** | Browse and watch videos |
| **Editor** | Upload and manage their own videos |
| **Admin** | Full access including deleting any video |

---

## 🚀 Deployment

| Part | Platform | Notes |
|---|---|---|
| Backend | Render (free) | Sleeps after 15 min inactivity |
| Frontend | Vercel (free) | Always fast |
| Database | MongoDB Atlas (free M0) | 512MB storage |
| Videos | Render disk (ephemeral) | Lost on redeploy — use S3 for production |

---

## ⚠️ Known Limitations

- Uploaded video files are stored on Render's **ephemeral disk** — they will be lost
  when the service redeploys. For production, files should be stored on AWS S3 or
  similar cloud storage.
- Free Render tier sleeps after 15 minutes of inactivity.
- Sensitivity analysis uses a heuristic/keyword-based approach rather than an ML model.
- No video compression — files are stored and streamed at original quality.

---

## 🎯 Design Decisions

- **Local file storage** was chosen to keep the setup simple for development.
  A cloud storage provider (AWS S3) would be used for real production.
- **Heuristic sensitivity scanning** (filename + metadata keywords) was used as a
  lightweight alternative to a full ML video classifier.
- **Socket.io** was preferred over HTTP polling for real-time progress updates
  due to its lower latency and simpler client API.
- **JWT stored in localStorage** for simplicity. In a real production app,
  HttpOnly cookies would be more secure.