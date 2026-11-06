import { useEffect, useState } from 'react';
import { api, Track } from '../api';

export function Catalog() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/tracks');
      setTracks(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('tracks:refresh', handler);
    return () => window.removeEventListener('tracks:refresh', handler);
  }, []);

  if (loading) return <p>Loading catalog...</p>;
  if (error) return <p className="status error">{error}</p>;
  if (tracks.length === 0) return <p style={{ color: '#888' }}>No tracks yet. Upload one!</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>Catalog ({tracks.length})</h3>
        <button onClick={load}>Refresh</button>
      </div>
      {tracks.map((t) => (
        <div key={t.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
            <div>
              <strong style={{ fontSize: 16 }}>{t.title}</strong>
              <div style={{ fontSize: 13, color: '#888' }}>{t.artist_name}</div>
            </div>
            <span style={{ fontSize: 12, color: '#666' }}>
              {t.duration_seconds ? `${Math.floor(t.duration_seconds / 60)}:${String(t.duration_seconds % 60).padStart(2, '0')}` : '—'}
            </span>
          </div>
          {t.stream_allowed && t.audio_url ? (
            <audio controls src={t.audio_url} style={{ width: '100%', marginTop: 8 }} preload="metadata" />
          ) : (
            <p style={{ fontSize: 13, color: '#888' }}>
              {t.stream_access === 'login_required' ? 'Login required to play' : 'Payment required'}
            </p>
          )}
          <div style={{ fontSize: 11, color: '#555', marginTop: 8 }} title={t.audio_url || ''}>
            audio: {t.audio_url || 'locked'}
          </div>
        </div>
      ))}
    </div>
  );
}
