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
    return (
      <div className="text-zinc-500 font-mono text-[11px] leading-relaxed">
        LOGIN REQUIRED TO UPLOAD.
        <br />
        <span className="text-zinc-700">
          Your WebID signs the request to your own Pod.
        </span>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', msg: 'NO FILE SELECTED' });

    setLoading(true);
    setStatus({ type: 'info', msg: 'READING FILE...' });

    try {
      const duration = await readDuration(file);

      setStatus({ type: 'info', msg: 'UPLOADING TO POD + ACL...' });
      const metadataUrl = await uploadTrack(
        file,
        { title, artist, genre, durationSeconds: duration },
        user.webid,
        session.fetch,
      );

      setStatus({ type: 'info', msg: 'SYNCING TO CATALOG...' });
      await api.post('/api/tracks/sync', { pod_resource_url: metadataUrl });

      setStatus({ type: 'success', msg: 'PUBLISHED. IN CATALOG.' });
      setFile(null);
      setTitle('');
      setGenre('');
      window.dispatchEvent(new Event('tracks:refresh'));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'UNKNOWN ERROR';
      setStatus({ type: 'error', msg: msg.toUpperCase() });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-[10px] font-mono text-zinc-500 block mb-1 tracking-widest">
          TITLE
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-zinc-500 block mb-1 tracking-widest">
          ARTIST
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
          className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-zinc-500 block mb-1 tracking-widest">
          GENRE
        </label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-zinc-500 block mb-1 tracking-widest">
          AUDIO FILE (MP3)
        </label>
        <label className="block border border-zinc-800 hover:border-zinc-700 p-3 cursor-pointer text-center text-[11px] font-mono text-zinc-400 transition-colors">
          <input
            type="file"
            accept="audio/mpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="hidden"
          />
          {file ? file.name : '[ CHOOSE FILE ]'}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold font-mono py-2 tracking-widest transition-colors"
      >
        {loading ? 'WORKING...' : 'PUBLISH'}
      </button>

      {status && (
        <div
          className={`text-[10px] font-mono px-2 py-2 border leading-tight ${
            status.type === 'error'
              ? 'border-accent text-accent bg-accent/5'
              : status.type === 'success'
              ? 'border-zinc-400 text-zinc-100 bg-zinc-900'
              : 'border-zinc-800 text-zinc-400'
          }`}
        >
          {status.msg}
        </div>
      )}
    </form>
  );
}
