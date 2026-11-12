import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, Track, Comment } from '../api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { LikeButton } from '../components/LikeButton';
import { CommentList } from '../components/comments/CommentList';
import { CommentForm } from '../components/comments/CommentForm';

function formatDuration(sec: number | null): string {
  if (!sec) return '--:--';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/tracks/${id}`),
      api.get(`/api/tracks/${id}/comments`),
    ])
      .then(([trackRes, commentsRes]) => {
        setTrack(trackRes.data.data);
        setComments(commentsRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-4 text-zinc-500 font-mono text-xs">FETCHING...</div>;
  }

  if (!track) {
    return <div className="p-4 text-zinc-500 font-mono text-xs">TRACK NOT FOUND.</div>;
  }

  const isCurrent = currentTrack?.id === track.id;
  const canPlay = track.stream_allowed && track.audio_url;

  function handlePlay() {
    if (canPlay && track) playTrack(track);
  }

  function handleLikeUpdate(newCount: number, newLiked: boolean) {
    if (!track) return;
    setTrack({ ...track, like_count: newCount, is_liked: newLiked });
  }

  function handleCommentCreated(c: Comment) {
    setComments([c, ...comments]);
  }

  function handleCommentDeleted(id: string) {
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        TRACK DETAIL
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-mono text-zinc-500 hover:text-accent mb-6 transition-colors"
          >
            ← BACK
          </button>

          {/* Header: cover + info */}
          <div className="flex gap-6 mb-8">
            {/* Cover */}
            <div className="w-48 h-48 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-zinc-700 font-mono text-5xl font-bold">
                {track.title.substring(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-2">
                TRACK
              </div>
              <h1 className="text-2xl font-bold text-zinc-100 mb-1 leading-tight">
                {track.title}
              </h1>

              <Link
                to={`/artists/${encodeURIComponent(track.owner_webid)}`}
                className="text-sm text-zinc-400 hover:text-accent transition-colors mb-4 inline-block"
              >
                {track.artist_name}
              </Link>

              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mb-6">
                <span>{(track.genre?.[0] || 'UNKNOWN').toUpperCase()}</span>
                <span>·</span>
                <span>{formatDuration(track.duration_seconds)}</span>
                <span>·</span>
                <LikeButton
                  trackId={track.id}
                  likeCount={track.like_count}
                  isLiked={track.is_liked}
                  onUpdate={handleLikeUpdate}
                />
              </div>

              {/* Play / Gating */}
              {canPlay ? (
                <button
                  onClick={handlePlay}
                  className="self-start text-[11px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white px-6 py-2 font-bold tracking-widest transition-colors"
                >
                  {isCurrent && isPlaying ? '|| PAUSE' : '> PLAY'}
                </button>
              ) : (
                <div className="flex flex-col gap-2 items-start">
                  <div className="text-[11px] font-mono text-accent border border-accent px-4 py-2 tracking-widest">
                    {track.stream_access === 'login_required'
                      ? 'LOGIN REQUIRED TO PLAY'
                      : 'PURCHASE REQUIRED TO PLAY'}
                  </div>
                  {!user && track.stream_access === 'login_required' && (
                    <div className="text-[10px] font-mono text-zinc-600">
                      Login via the header to unlock this track.
                    </div>
                  )}
                  {track.stream_access === 'paid' && (
                    <div className="text-[10px] font-mono text-zinc-600">
                      Purchase flow coming Week 3.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="border-t border-zinc-800 pt-6">
            <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-4">
              COMMENTS ({comments.length})
            </div>

            <div className="mb-6">
              <CommentForm trackId={track.id} onCreated={handleCommentCreated} />
            </div>

            <CommentList comments={comments} onDelete={handleCommentDeleted} />
          </div>
        </div>
      </div>
    </div>
  );
}
