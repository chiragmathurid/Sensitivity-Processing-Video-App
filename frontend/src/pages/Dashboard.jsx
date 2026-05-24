import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, safe: 0, flagged: 0, processing: 0 });

  useEffect(() => {
    api.get('/videos').then(({ data }) => {
      setStats({
        total: data.length,
        safe: data.filter(v => v.status === 'safe').length,
        flagged: data.filter(v => v.status === 'flagged').length,
        processing: data.filter(v => ['pending', 'processing'].includes(v.status)).length,
      });
    });
  }, []);

  const statCards = [
    { label: 'Total videos', value: stats.total, color: 'var(--color-text-primary)' },
    { label: 'Safe', value: stats.safe, color: 'var(--color-text-success)' },
    { label: 'Flagged', value: stats.flagged, color: 'var(--color-text-danger)' },
    { label: 'Pending', value: stats.processing, color: 'var(--color-text-warning)' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          Here's an overview of your video library.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 32
      }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 8, padding: '14px 16px'
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 500, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Quick actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Upload a video', sub: 'Add new content', path: '/upload', color: '#1D9E75' },
          { label: 'Browse library', sub: 'View all your videos', path: '/library', color: '#378ADD' },
          { label: 'View flagged', sub: `${stats.flagged} flagged`, path: '/library?filter=flagged', color: '#E24B4A' },
        ].map(({ label, sub, path, color }) => (
          <div key={label}
            onClick={() => navigate(path)}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
            }}>
            <p style={{ fontWeight: 500, marginBottom: 4, color }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;