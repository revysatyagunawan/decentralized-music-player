import { api, Comment } from '../../api';

interface Props {
  comments: Comment[];
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function CommentList({ comments, onDelete }: Props) {
  if (comments.length === 0) {
    return (
      <div className="text-[10px] font-mono text-zinc-600 py-4">
        NO COMMENTS YET.
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/comments/${id}`);
      onDelete(id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col">
      {comments.map((c) => (
        <div
          key={c.id}
          className="py-3 border-b border-zinc-800 last:border-b-0"
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[11px] font-bold text-zinc-200 truncate">
                {c.display_name}
              </span>
              <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                {formatDate(c.created_at)}
              </span>
            </div>
            {c.is_owner && (
              <button
                onClick={() => handleDelete(c.id)}
                className="text-[9px] font-mono text-zinc-600 hover:text-accent transition-colors shrink-0"
                title="Delete"
              >
                DELETE
              </button>
            )}
          </div>
          <p className="text-[12px] text-zinc-300 whitespace-pre-wrap break-words">
            {c.content}
          </p>
        </div>
      ))}
    </div>
  );
}
