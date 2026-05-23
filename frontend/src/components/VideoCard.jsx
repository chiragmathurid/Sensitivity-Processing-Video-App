import { useVideoProgress } from '../context/SocketContext';

function VideoCard({ video }) {
    // This single line gives you live updates for THIS specific video
    const progress = useVideoProgress(video._id);

    // Decide what status to show — live progress overrides DB status
    const displayStatus = progress ? progress.status || 'processing' : video.status;

    const badgeStyle = {
        safe: { background: '#e1f5ee', color: '#0f6e56' },
        flagged: { background: '#fcebeb', color: '#a32d2d' },
        processing: { background: '#faeeda', color: '#854f0b' },
        pending: { background: '#f1efe8', color: '#5f5e5a' },
    };

    return (
        <div style={{
            border: '1px solid #e0e0e0', borderRadius: 8,
            padding: 16, marginBottom: 12
        }}>
            <p style={{ fontWeight: 500, margin: '0 0 4px' }}>{video.originalName}</p>
            <p style={{ fontSize: 13, color: 'gray', margin: '0 0 8px' }}>
                {(video.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {/* Status badge */}
            <span style={{
                ...badgeStyle[displayStatus],
                padding: '2px 10px', borderRadius: 12, fontSize: 12
            }}>
                {displayStatus}
            </span>

            {/* Live progress bar — only visible while analysing */}
            {progress && !progress.done && (
                <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12, color: 'gray', margin: '0 0 4px' }}>
                        {progress.message} — {progress.percent}%
                    </p>
                    <div style={{ background: '#e0e0e0', borderRadius: 4, height: 6 }}>
                        <div style={{
                            width: `${progress.percent}%`,
                            background: '#1D9E75', height: '100%',
                            borderRadius: 4, transition: 'width 0.3s'
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoCard;