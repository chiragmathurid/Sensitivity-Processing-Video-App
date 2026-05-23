const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const Video = require('../models/Video');

// ─── Sensitivity scoring rules ───────────────────────────────────────────────
// Each rule adds points to a "risk score". Score > 50 = flagged.
// This is a heuristic system — you can make it as sophisticated as you like.

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

const analyzeVideo = async (io, videoId, filepath, originalName) => {
    try {
        // ── Stage 1: Mark as processing ──────────────────────────────────────────
        await Video.findByIdAndUpdate(videoId, { status: 'processing' });
        io.emit('analysis:progress', {
            videoId,
            percent: 10,
            message: 'Starting analysis...'
        });

        // ── Stage 2: Extract metadata with FFprobe ────────────────────────────────
        let metadata = {};
        try {
            metadata = await getVideoMetadata(filepath);
            // Save duration to the video document
            await Video.findByIdAndUpdate(videoId, { duration: metadata.duration });
        } catch (ffmpegErr) {
            // FFprobe failed — log it but continue with what we have
            console.warn('FFprobe error (continuing):', ffmpegErr.message);
        }

        io.emit('analysis:progress', {
            videoId,
            percent: 40,
            message: 'Metadata extracted...'
        });

        // Simulate processing time so the progress bar is visible
        await new Promise(resolve => setTimeout(resolve, 1500));

        // ── Stage 3: Calculate sensitivity score ─────────────────────────────────
        let score = 0;
        score += scoreByFilename(originalName);
        score += scoreByDuration(metadata.duration || 0);
        score += scoreByFileSize(metadata.size || 0);

        io.emit('analysis:progress', {
            videoId,
            percent: 75,
            message: 'Analysing content...'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // ── Stage 4: Final verdict ────────────────────────────────────────────────
        const finalStatus = score > 50 ? 'flagged' : 'safe';

        await Video.findByIdAndUpdate(videoId, {
            status: finalStatus,
            // Optionally store the score for debugging
        });

        io.emit('analysis:progress', {
            videoId,
            percent: 100,
            message: `Analysis complete — ${finalStatus}`,
            status: finalStatus,
            done: true
        });

        console.log(`Video ${videoId} → ${finalStatus} (score: ${score})`);

    } catch (err) {
        // If anything goes wrong, mark as flagged (fail safe)
        console.error('Analysis error:', err);
        await Video.findByIdAndUpdate(videoId, { status: 'flagged' });
        io.emit('analysis:progress', {
            videoId,
            percent: 100,
            message: 'Analysis failed — marked for review',
            status: 'flagged',
            done: true
        });
    }
};

module.exports = { analyzeVideo };