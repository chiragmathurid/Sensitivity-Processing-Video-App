const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    // Original filename the user uploaded (e.g. "my-holiday.mp4")
    originalName: { type: String, required: true },

    // The name we save it as on disk (unique, no spaces)
    filename: { type: String, required: true },

    // Full path on the server (e.g. "uploads/1716123456789-abc.mp4")
    filepath: { type: String, required: true },

    // File size in bytes
    size: { type: Number, required: true },

    // MIME type (e.g. "video/mp4")
    mimetype: { type: String, required: true },

    // Video duration in seconds — filled by FFmpeg in Phase 4
    duration: { type: Number, default: 0 },

    // Processing status — this drives your whole UI
    status: {
        type: String,
        enum: ['pending', 'processing', 'safe', 'flagged'],
        default: 'pending'
    },

    // Which user uploaded this — links to the User model
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Video', videoSchema); 