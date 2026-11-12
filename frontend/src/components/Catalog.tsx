import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Track } from '../api';
import { usePlayer } from '../contexts/PlayerContext';
import { LikeButton } from './LikeButton';

interface Props {
  searchQuery: string;
}

export function Catalog({ searchQuery }: Props) {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  async function load() {
    setLoading(true);
    try {
      const trimmed = searchQuery.trim();
      const endpoint = trimmed
        ? `/api/search?q=${encodeURIComponent(trimmed)}`
        : '/api/tracks';
      const res = await api.get(endpoint);
      setTracks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [searchQuery]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('tracks:refresh', handler);
    return () => window.removeEventListener('tracks:refresh', handler);
  }, []);

  function handleLikeUpdate(trackId: string, newCount: number, newLiked: boolean) {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, like_count: newCount, is_liked: newLiked } : t,
      ),
    );
  }

  if (loading) return <div className="text-zinc-500 font-mono text-xs">FETCHING...</div>;

  if (tracks.length === 0) {
    return (
      <div className="text-zinc-500 font-mono text-xs leading-relaxed">
        {searchQuery ? `NO RESULTS FOR "${searchQuery.toUpperCase()}".` : 'NO TRACKS FOUND.'}
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
              ${isCurrent ? 'bg-zinc-900/50 border-zinc-700' : 'border-transparent hover:border-zinc-700'}
            `}
          >
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
            </div>

            <div className="mt-2 flex flex-col">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tracks/${t.id}`);
                }}
                className={`font-bold text-xs leading-tight truncate text-left hover:text-accent transition-colors ${
                  isCurrent ? 'text-accent' : 'text-zinc-100'
                }`}
                title={t.title}
              >
                {t.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artists/${encodeURIComponent(t.owner_webid)}`);
                }}
                className="text-[11px] text-zinc-400 truncate mt-0.5 text-left hover:text-accent transition-colors"
              >
                {t.artist_name}
              </button>
              <div className="flex justify-between items-center mt-1 font-mono text-[9px] text-zinc-600">
                <div className="flex items-center gap-2">
                  <LikeButton
                    trackId={t.id}
                    likeCount={t.like_count}
                    isLiked={t.is_liked}
                    onUpdate={(c, l) => handleLikeUpdate(t.id, c, l)}
                  />
                  <span>·</span>
                  <span>{(t.genre?.[0] || 'UNKNOWN').toUpperCase()}</span>
                </div>
                <span>
                  {t.duration_seconds
                    ? `${Math.floor(t.duration_seconds / 60)}:${String(t.duration_seconds % 60).padStart(2, '0')}`
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
