const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect, requireRole } = require('../middleware/auth');
const {
    uploadVideo,
    getVideos,
    getVideoById,
    deleteVideo,
    streamVideo 
} = require('../controllers/videoController');

router.get('/stream/:id', protect, streamVideo);

// GET  /api/videos          — any logged-in user
router.get('/', protect, getVideos);

// GET  /api/videos/:id      — any logged-in user
router.get('/:id', protect, getVideoById);

// POST /api/videos/upload   — editor or admin only
// upload.single('video') is Multer — 'video' must match the field name in the form
router.post('/upload', protect, requireRole('editor', 'admin'), upload.single('video'), uploadVideo);

// DELETE /api/videos/:id    — admin only
router.delete('/:id', protect, requireRole('admin'), deleteVideo);

module.exports = router;