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

// GET /api/videos/stream/:id
exports.streamVideo = async (req, res) => {
  try {
    // Find the video — only allow the owner to stream it
    const video = await Video.findOne({
      _id:      req.params.id,
      uploader: req.user._id
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only allow streaming of safe videos
    if (video.status === 'flagged') {
      return res.status(403).json({ message: 'This video has been flagged and cannot be played' });
    }

    if (video.status === 'pending' || video.status === 'processing') {
      return res.status(425).json({ message: 'Video is still being processed' });
    }

    const filepath = video.filepath;

    // Check the file actually exists on disk
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Video file not found on server' });
    }

    const stat     = fs.statSync(filepath);
    const fileSize = stat.size;
    const range    = req.headers.range; // e.g. "bytes=0-1048576"

    if (!range) {
      // No range header — send the whole file (fallback)
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type':   video.mimetype || 'video/mp4',
      });
      fs.createReadStream(filepath).pipe(res);
      return;
    }

    // ── Parse the Range header ────────────────────────────────────────────────
    const parts    = range.replace(/bytes=/, '').split('-');
    const start    = parseInt(parts[0], 10);
    const end      = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024, fileSize - 1);
    // 1MB chunks — good balance between memory use and buffering

    // Validate range values
    if (start >= fileSize || end >= fileSize) {
      res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const chunkSize = end - start + 1;

    // ── Send partial content response ─────────────────────────────────────────
    res.writeHead(206, {  // 206 = Partial Content (NOT 200)
      'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges':  'bytes',
      'Content-Length': chunkSize,
      'Content-Type':   video.mimetype || 'video/mp4',
    });

    // Stream just that chunk from disk — never load the whole file into memory
    const stream = fs.createReadStream(filepath, { start, end });
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Streaming error' });
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};