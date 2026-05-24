import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function VideoPlayer() {
    const { id } = useParams(); // video ID from URL: /player/665abc123
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch video metadata first to check status and get the name
        api.get(`/videos/${id}`)
            .then(({ data }) => { setVideo(data); setLoading(false); })
            .catch(() => { setError('Video not found'); setLoading(false); });
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // Build the streaming URL — include the token in the query string
    // because <video> src can't set custom headers
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const streamUrl = `${baseUrl}/api/videos/stream/${id}?token=${token}`;

    const statusColor = { safe: 'green', flagged: 'red', processing: 'orange' };

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
            <button onClick={() => navigate('/library')}
                style={{ marginBottom: 16, cursor: 'pointer' }}>
                ← Back to library
            </button>

            <h2 style={{ marginBottom: 4 }}>{video.originalName}</h2>

            <span style={{
                fontSize: 12, padding: '2px 10px', borderRadius: 12,
                background: video.status === 'safe' ? '#e1f5ee' : '#fcebeb',
                color: statusColor[video.status] || 'gray',
                marginBottom: 16, display: 'inline-block'
            }}>
                {video.status}
            </span>

            {video.status === 'flagged' ? (
                <div style={{
                    padding: 24, background: '#fcebeb',
                    borderRadius: 8, marginTop: 16
                }}>
                    <p style={{ color: '#a32d2d', margin: 0 }}>
                        This video has been flagged and cannot be played.
                    </p>
                </div>
            ) : video.status !== 'safe' ? (
                <div style={{
                    padding: 24, background: '#faeeda',
                    borderRadius: 8, marginTop: 16
                }}>
                    <p style={{ color: '#854f0b', margin: 0 }}>
                        Video is still being processed. Please check back shortly.
                    </p>
                </div>
            ) : (
                <video
                    controls
                    width="100%"
                    style={{ borderRadius: 8, marginTop: 16, background: '#000', maxHeight: '480px', objectFit: 'contain', }}
                    src={streamUrl}
                >
                    Your browser does not support video playback.
                </video>
            )}

            <div style={{ marginTop: 16, fontSize: 13, color: 'gray' }}>
                <p>Size: {(video.size / 1024 / 1024).toFixed(2)} MB</p>
                {video.duration > 0 && (
                    <p>Duration: {Math.floor(video.duration / 60)}m {Math.floor(video.duration % 60)}s</p>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;