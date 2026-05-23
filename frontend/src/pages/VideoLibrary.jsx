import { useState, useEffect } from 'react';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

function VideoLibrary() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        api.get('/videos').then(({ data }) => setVideos(data));
    }, []);

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
            <h2>My videos</h2>
            {videos.length === 0
                ? <p style={{ color: 'gray' }}>No videos uploaded yet.</p>
                : videos.map(v => <VideoCard key={v._id} video={v} />)
            }
        </div>
    );
}

export default VideoLibrary;