import { useState, useCallback } from 'react';
import api from '../api/axios';
import { useAnalysisSocket } from '../hooks/useAnalysisSocket';

function Upload() {
    const [file, setFile] = useState(null);
    const [uploadPct, setUploadPct] = useState(0);
    const [uploadDone, setUploadDone] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    // analysis = { percent, message, status, done }
    const [error, setError] = useState('');
    const [videoId, setVideoId] = useState(null);

    // Listen for socket events — only update state for OUR video
    const handleProgress = useCallback((data) => {
        if (videoId && data.videoId.toString() === videoId.toString()) {
            setAnalysis(data);
        }
    }, [videoId]);

    useAnalysisSocket(handleProgress);

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('video', file);

        try {
            setError('');
            setUploadPct(0);
            setUploadDone(false);
            setAnalysis(null);

            const { data } = await api.post('/videos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setUploadPct(Math.round(e.loaded * 100 / e.total))
            });

            setUploadDone(true);
            setVideoId(data.video._id); // store ID so socket listener knows which video
            setFile(null);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        }
    };

    // Status badge colour
    const badgeColor = {
        safe: 'green',
        flagged: 'red',
        processing: 'orange',
        pending: 'gray'
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
            <h2>Upload video</h2>

            <input type="file" accept="video/*"
                onChange={e => setFile(e.target.files[0])} />

            {file && <p style={{ color: 'gray', fontSize: 14 }}>
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>}

            <button onClick={handleUpload} disabled={!file}>Upload</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Upload progress */}
            {uploadPct > 0 && !uploadDone && (
                <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13 }}>Uploading... {uploadPct}%</p>
                    <div style={{ background: '#e0e0e0', borderRadius: 4, height: 8 }}>
                        <div style={{
                            width: `${uploadPct}%`, background: '#378ADD',
                            height: '100%', borderRadius: 4, transition: 'width 0.2s'
                        }} />
                    </div>
                </div>
            )}

            {/* Analysis progress — appears after upload completes */}
            {uploadDone && (
                <div style={{
                    marginTop: 24, padding: 16,
                    border: '1px solid #e0e0e0', borderRadius: 8
                }}>
                    <p style={{ fontWeight: 500 }}>Analysing video...</p>

                    {analysis ? (
                        <>
                            <p style={{ fontSize: 13, color: 'gray' }}>{analysis.message}</p>
                            <div style={{ background: '#e0e0e0', borderRadius: 4, height: 8, margin: '8px 0' }}>
                                <div style={{
                                    width: `${analysis.percent}%`, background: '#1D9E75',
                                    height: '100%', borderRadius: 4, transition: 'width 0.3s'
                                }} />
                            </div>
                            <p style={{ fontSize: 13 }}>{analysis.percent}%</p>

                            {analysis.done && (
                                <p style={{
                                    marginTop: 8, fontWeight: 500,
                                    color: badgeColor[analysis.status] || 'gray'
                                }}>
                                    Result: {analysis.status?.toUpperCase()}
                                </p>
                            )}
                        </>
                    ) : (
                        <p style={{ fontSize: 13, color: 'gray' }}>Waiting for analysis to start...</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Upload;