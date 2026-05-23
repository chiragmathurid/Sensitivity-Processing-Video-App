const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth'); // import the middleware

// You'll create these controller functions in Phase 3
// For now, add placeholder functions so the file doesn't crash
const getVideos = (req, res) => res.json({ message: 'getVideos — coming in Phase 3' });
const uploadVideo = (req, res) => res.json({ message: 'uploadVideo — coming in Phase 3' });
const deleteVideo = (req, res) => res.json({ message: 'deleteVideo — coming in Phase 3' });

// Anyone logged in can view videos
router.get('/', protect, getVideos);

// Only editors and admins can upload
router.post('/upload', protect, requireRole('editor', 'admin'), uploadVideo);

// Only admins can delete
router.delete('/:id', protect, requireRole('admin'), deleteVideo);

module.exports = router;