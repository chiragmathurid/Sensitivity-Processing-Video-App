import { useState } from 'react';
import api from '../api/axios';

function Upload() {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [message, setMessage] = useState('');
    const [uploadedVideo, setUploadedVideo] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];

        // Basic frontend validation before even sending
        if (!selected) return;

        if (!selected.type.startsWith('video/')) {
            setMessage('Please select a video file.');
            return;
        }

        if (selected.size > 100 * 1024 * 1024) {
            setMessage('File is too large. Max size is 100MB.');
            return;
        }

        setFile(selected);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) return setMessage('Please select a file first.');

        // FormData is how you send files over HTTP — NOT JSON
        const formData = new FormData();
        formData.append('video', file); // 'video' must match upload.single('video') in routes

        try {
            setStatus('uploading');
            setProgress(0);

            const { data } = await api.post('/videos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },

                // onUploadProgress fires repeatedly as bytes are sent
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percent);
                }
            });

            setStatus('success');
            setUploadedVideo(data.video);
            setMessage('Video uploaded successfully!');
            setFile(null);

        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Upload failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 16px' }}>
            <h2>Upload video</h2>

            <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={status === 'uploading'}
            />

            {file && (
                <p style={{ color: 'gray', fontSize: '14px' }}>
                    {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            )}

            {/* Progress bar — only visible while uploading */}
            {status === 'uploading' && (
                <div style={{ margin: '12px 0' }}>
                    <div style={{
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        height: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            background: '#378ADD',
                            height: '100%',
                            transition: 'width 0.2s ease'
                        }} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'gray' }}>{progress}% uploaded</p>
                </div>
            )}

            {message && (
                <p style={{ color: status === 'error' ? 'red' : 'green' }}>
                    {message}
                </p>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
            >
                {status === 'uploading' ? 'Uploading...' : 'Upload video'}
            </button>

            {/* Show the result after upload */}
            {uploadedVideo && (
                <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <p><strong>Name:</strong> {uploadedVideo.originalName}</p>
                    <p><strong>Size:</strong> {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Status:</strong> {uploadedVideo.status}</p>
                </div>
            )}
        </div>
    );
}

export default Upload;