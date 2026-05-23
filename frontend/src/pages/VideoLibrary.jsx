import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VideoCard from '../components/VideoCard';

const FILTERS = ['all', 'safe', 'flagged', 'processing', 'pending'];

function VideoLibrary() {
    const [videos, setVideos] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        // Support ?filter=flagged from dashboard quick action
        const f = params.get('filter');
        if (f && FILTERS.includes(f)) setFilter(f);
    }, [params]);

    useEffect(() => {
        api.get('/videos')
            .then(({ data }) => setVideos(data))
            .finally(() => setLoading(false));
    }, []);

    // Filter + search combined
    const filtered = videos.filter(v => {
        const matchesFilter = activeFilter === 'all' || v.status === activeFilter;
        const matchesSearch = v.originalName.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 24
            }}>
                <h1 style={{ fontSize: 22, fontWeight: 500 }}>My videos</h1>
                <button onClick={() => navigate('/upload')} style={{
                    padding: '7px 16px', background: '#1D9E75', color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13,
                    cursor: 'pointer', fontWeight: 500
                }}>
                    + Upload video
                </button>
            </div>

            {/* Search + filter bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    placeholder="Search videos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200, padding: '7px 12px',
                        borderRadius: 8, border: '0.5px solid var(--color-border-secondary)',
                        background: 'var(--color-background-primary)',
                        color: 'var(--color-text-primary)', fontSize: 13
                    }}
                />
                {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        border: '0.5px solid var(--color-border-secondary)',
                        background: activeFilter === f
                            ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                        color: activeFilter === f
                            ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontWeight: activeFilter === f ? 500 : 400,
                        textTransform: 'capitalize'
                    }}>
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading videos...</p>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '48px 0',
                    color: 'var(--color-text-secondary)'
                }}>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>No videos found</p>
                    <p style={{ fontSize: 13 }}>
                        {search ? 'Try a different search term' : 'Upload your first video to get started'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16
                }}>
                    {filtered.map(v => <VideoCard key={v._id} video={v} />)}
                </div>
            )}
        </div>
    );
}

export default VideoLibrary;