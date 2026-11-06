import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { uploadTrack, readDuration } from '../lib/pod-writer';

export function UploadForm() {
  const { user, session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(user?.display_name || '');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState<{ type: 'info' | 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !session) {
    return <p style={{ color: '#888' }}>Login required to upload.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', msg: 'Pilih file MP3 dulu' });

    setLoading(true);
    setStatus({ type: 'info', msg: 'Reading file...' });

    try {
      const duration = await readDuration(file);

      setStatus({ type: 'info', msg: 'Uploading to Pod + setting ACL...' });
      const metadataUrl = await uploadTrack(
        file,
        { title, artist, genre, durationSeconds: duration },
        user.webid,
        session.fetch,
      );

      setStatus({ type: 'info', msg: 'Syncing to catalog...' });
      await api.post('/api/tracks/sync', { pod_resource_url: metadataUrl });

      setStatus({ type: 'success', msg: 'Published! Track in catalog.' });
      setFile(null);
      setTitle('');
      setGenre('');
      // Trigger refresh
      window.dispatchEvent(new Event('tracks:refresh'));
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      setStatus({ type: 'error', msg: `Failed: ${msg}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: 16 }}>Upload Track</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Genre (optional)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <input
          type="file"
          accept="audio/mpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload & Publish'}
        </button>
        {status && <div className={`status ${status.type}`}>{status.msg}</div>}
      </div>
    </form>
  );
}
