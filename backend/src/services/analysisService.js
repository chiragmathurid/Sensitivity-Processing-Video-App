const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');      // ← ADD
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const path = require('path');
const Video = require('../models/Video');

// ─── Sensitivity scoring rules ───────────────────────────────────────────────
// Each rule adds points to a "risk score". Score > 50 = flagged.
// This is a heuristic system — you can make it as sophisticated as you like.

ffmpeg.setFfmpegPath(ffmpegInstaller.path);                       // ← ADD
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const FLAGGED_KEYWORDS = [
    'violence', 'adult', 'explicit', 'nsfw', 'gore',
    'fight', 'weapon', 'blood', 'naked', 'sex'
];

function scoreByFilename(filename) {
    const lower = filename.toLowerCase();
    for (const keyword of FLAGGED_KEYWORDS) {
        if (lower.includes(keyword)) {
            return 80; // instant high score on keyword match
        }
    }
    return 0;
}

function scoreByDuration(durationSeconds) {
    // Very long videos (>2 hours) get a small bump — more content to review
    if (durationSeconds > 7200) return 15;
    return 0;
}

function scoreByFileSize(sizeBytes) {
    const sizeMB = sizeBytes / (1024 * 1024);
    // Unusually large files for their type can be suspicious
    if (sizeMB > 500) return 10;
    return 0;
}

// ─── FFprobe metadata extraction ─────────────────────────────────────────────
function getVideoMetadata(filepath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filepath, (err, metadata) => {
            if (err) return reject(err);

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            resolve({
                duration: metadata.format.duration || 0,
                size: metadata.format.size || 0,
                codec: videoStream?.codec_name || 'unknown',
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
                bitrate: metadata.format.bit_rate || 0,
            });
        });
    });
}

// ─── Main analysis function ───────────────────────────────────────────────────
// Called from the upload controller AFTER responding 201.
// io  = the Socket.io server instance (passed in from controller)
// videoId  = MongoDB _id of the video document
// filepath = absolute path to the saved file
// originalName = original filename (for keyword checking)

// At the top of analyzeVideo, accept the uploaderId
const analyzeVideo = async (io, videoId, filepath, originalName, uploaderId) => {

    // Helper — emit only to the user who uploaded this video
    const emitProgress = (percent, message, extra = {}) => {
        io.to(uploaderId.toString()).emit('analysis:progress', {
            videoId,
            percent,
            message,
            ...extra
        });
    };

    try {
        await Video.findByIdAndUpdate(videoId, { status: 'processing' });
        emitProgress(10, 'Starting analysis...');

        let metadata = {};
        try {
            metadata = await getVideoMetadata(filepath);
            await Video.findByIdAndUpdate(videoId, { duration: metadata.duration });
        } catch (err) {
            console.warn('FFprobe error:', err.message);
        }

        emitProgress(40, 'Metadata extracted...');
        await new Promise(r => setTimeout(r, 1500));

        let score = 0;
        score += scoreByFilename(originalName);
        score += scoreByDuration(metadata.duration || 0);
        score += scoreByFileSize(metadata.size || 0);

        emitProgress(75, 'Analysing content...');
        await new Promise(r => setTimeout(r, 1000));

        const finalStatus = score > 50 ? 'flagged' : 'safe';
        await Video.findByIdAndUpdate(videoId, { status: finalStatus });

        emitProgress(100, `Analysis complete — ${finalStatus}`, {
            status: finalStatus,
            done: true
        });

    } catch (err) {
        console.error('Analysis error:', err);
        await Video.findByIdAndUpdate(videoId, { status: 'flagged' });
        io.to(uploaderId.toString()).emit('analysis:ffmpeg', {
            videoId, percent: 100, message: 'Analysis failed',
            status: 'flagged', done: true
        });
    }
};

module.exports = { analyzeVideo };