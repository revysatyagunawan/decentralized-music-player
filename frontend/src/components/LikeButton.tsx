import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  trackId: string;
  likeCount: number;
  isLiked: boolean;
  onUpdate: (newCount: number, newLiked: boolean) => void;
}

export function LikeButton({ trackId, likeCount, isLiked, onUpdate }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        const res = await api.delete(`/api/tracks/${trackId}/likes`);
        onUpdate(res.data.data.like_count, false);
      } else {
        const res = await api.post(`/api/tracks/${trackId}/likes`);
        onUpdate(res.data.data.like_count, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!user || loading}
      className={`
        text-[9px] font-mono transition-colors
        ${isLiked ? 'text-accent' : 'text-zinc-600 hover:text-zinc-400'}
        ${!user ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={!user ? 'Login to like' : isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? '♥' : '♡'} {likeCount}
    </button>
  );
}
