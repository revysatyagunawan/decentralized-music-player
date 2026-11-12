import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Track } from '../api';
import { usePlayer } from '../contexts/PlayerContext';

export function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/tracks/${id}`)
      .then((res) => setTrack(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-zinc-500 font-mono text-xs">FETCHING...</div>;
  if (!track) return <div className="p-4 text-zinc-500 font-mono text-xs">TRACK NOT FOUND.</div>;

  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        TRACK DETAIL
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-mono text-zinc-500 hover:text-accent mb-4 transition-colors"
        >
          ← BACK
        </button>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">{track.title}</h1>
        <p className="text-sm text-zinc-400 mb-4">{track.artist_name}</p>
        <button
          onClick={() => playTrack(track)}
          className="text-[11px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white px-4 py-2 font-bold tracking-widest transition-colors"
        >
          {isCurrent && isPlaying ? '|| PAUSE' : '> PLAY'}
        </button>
        <p className="mt-8 text-[10px] font-mono text-zinc-600">
          [ Comments & full detail coming in Session 2 ]
        </p>
      </div>
    </div>
  );
}
