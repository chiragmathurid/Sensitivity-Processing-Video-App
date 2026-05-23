const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

const { analyzeVideo } = require('../services/analysisService');

exports.uploadVideo = async (req, res) => {
  try {
    // If Multer rejected the file, req.file won't exist
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // req.file is populated by Multer — contains filename, size, mimetype etc.
    // req.user is populated by the protect middleware from Phase 2
    const video = await Video.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploader: req.user._id,
      status: 'pending'
    });

    // ── Respond immediately — don't make the user wait ─────────────────────
    res.status(201).json({ message: 'Video uploaded successfully', video });

    // ── THEN kick off analysis in the background ───────────────────────────
    // Notice: no 'await' here — this runs after the response is already sent
    const io = req.app.get('io');
    analyzeVideo(io, video._id, video.filepath, video.originalName, req.user._id); 

  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => { });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/videos — list only the logged-in user's videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.user._id })
      .sort({ createdAt: -1 }); // newest first
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/videos/:id — get a single video (must belong to this user)
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploader: req.user._id  // prevents users seeing each other's videos
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, uploader: req.user._id });
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Delete the physical file from disk first
    if (fs.existsSync(video.filepath)) {
      fs.unlinkSync(video.filepath);
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};