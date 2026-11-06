import { useEffect, useState } from 'react';
import { api, Track } from '../api';
import { usePlayer } from '../contexts/PlayerContext';

export function Catalog() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/api/tracks');
      setTracks(res.data.data);
    } catch (err) {
      console.error(err);
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

  if (loading) {
    return <div className="text-zinc-500 font-mono text-xs">FETCHING...</div>;
  }

  if (tracks.length === 0) {
    return (
      <div className="text-zinc-500 font-mono text-xs leading-relaxed">
        NO TRACKS FOUND.
        <br />
        <span className="text-zinc-700">Upload one on the right panel.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {tracks.map((t) => {
        const isCurrent = currentTrack?.id === t.id;
        const canPlay = t.stream_allowed && t.audio_url;

        return (
          <div
            key={t.id}
            onClick={() => canPlay && playTrack(t)}
            className={`
              group flex flex-col border p-1 transition-colors
              ${canPlay ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
              ${isCurrent
                ? 'bg-zinc-900/50 border-zinc-700'
                : 'border-transparent hover:border-zinc-700'}
            `}
          >
            {/* Cover */}
            <div className="w-full aspect-square bg-zinc-900 border border-zinc-800 relative flex items-center justify-center overflow-hidden">
              <span className="text-zinc-700 font-mono text-3xl font-bold">
                {t.title.substring(0, 2).toUpperCase()}
              </span>

              {canPlay && (
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-mono text-xs border border-white px-2 py-1">
                    {isCurrent && isPlaying ? 'PAUSE' : 'PLAY'}
                  </span>
                </div>
              )}

              {isCurrent && isPlaying && (
                <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-mono px-1.5 py-0.5">
                  ▶
                </div>
              )}

              {!canPlay && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-zinc-400 text-[9px] font-mono text-center py-0.5">
                  {t.stream_access === 'login_required' ? 'LOGIN' : 'PAID'}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-2 flex flex-col">
              <span
                className={`font-bold text-xs leading-tight truncate ${
                  isCurrent ? 'text-accent' : 'text-zinc-100'
                }`}
                title={t.title}
              >
                {t.title}
              </span>
              <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                {t.artist_name}
              </span>
              <div className="flex justify-between items-center mt-1 font-mono text-[9px] text-zinc-600">
                <span>{(t.genre?.[0] || 'UNKNOWN').toUpperCase()}</span>
                <span>
                  {t.duration_seconds
                    ? `${Math.floor(t.duration_seconds / 60)}:${String(
                        t.duration_seconds % 60,
                      ).padStart(2, '0')}`
                    : '--:--'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
