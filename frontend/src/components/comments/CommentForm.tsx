import { useState, FormEvent } from 'react';
import { api, Comment } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  trackId: string;
  onCreated: (comment: Comment) => void;
}

export function CommentForm({ trackId, onCreated }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-[10px] font-mono text-zinc-600 py-4">
        LOGIN TO COMMENT.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.post(`/api/tracks/${trackId}/comments`, {
        content: content.trim(),
      });
      onCreated(res.data.data);
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        maxLength={2000}
        className="w-full bg-transparent border border-zinc-800 text-[12px] px-3 py-2 outline-none focus:border-zinc-400 text-zinc-200 placeholder:text-zinc-700 resize-none font-sans"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-600">
          {content.length}/2000
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="text-[10px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 font-bold tracking-widest transition-colors"
        >
          {loading ? 'POSTING...' : 'POST'}
        </button>
      </div>
    </form>
  );
}
