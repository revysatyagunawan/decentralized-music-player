import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, Track } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { UploadForm } from '../components/UploadForm';

interface EditForm {
  title: string;
  artist_name: string;
  description: string;
  genre: string;
  stream_access: 'free' | 'login_required' | 'paid';
  download_enabled: boolean;
  download_price_cents: number;
  tip_enabled: boolean;
}

function trackToEditForm(t: Track): EditForm {
  return {
    title: t.title,
    artist_name: t.artist_name,
    description: t.description || '',
    genre: t.genre?.join(', ') || '',
    stream_access: t.stream_access,
    download_enabled: t.download_enabled ?? false,
    download_price_cents: t.download_price_cents ?? 0,
    tip_enabled: t.tip_enabled ?? true,
  };
}

export function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [editing, setEditing] = useState<Track | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadTracks() {
    if (!user) return;
    setLoadingTracks(true);
    try {
      const res = await api.get('/api/tracks/mine');
      setTracks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTracks(false);
    }
  }

  useEffect(() => {
    loadTracks();
  }, [user]);

  useEffect(() => {
    const handler = () => loadTracks();
    window.addEventListener('tracks:refresh', handler);
    return () => window.removeEventListener('tracks:refresh', handler);
  }, [user]);

  if (isLoading) {
    return <div className="p-4 text-zinc-500 font-mono text-xs">LOADING...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
          DASHBOARD
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500 font-mono text-xs text-center leading-relaxed">
            LOGIN REQUIRED.
            <br />
            <span className="text-zinc-700">Connect your Pod to access dashboard.</span>
          </div>
        </div>
      </div>
    );
  }

  function openEdit(track: Track) {
    setEditing(track);
    setEditForm(trackToEditForm(track));
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing || !editForm || saving) return;

    setSaving(true);
    try {
      const updates: any = {
        title: editForm.title,
        artist_name: editForm.artist_name,
        description: editForm.description || null,
        genre: editForm.genre
          ? editForm.genre.split(',').map((g) => g.trim()).filter(Boolean)
          : null,
        stream_access: editForm.stream_access,
        download_enabled: editForm.download_enabled,
        download_price_cents: editForm.download_price_cents,
        tip_enabled: editForm.tip_enabled,
      };

      await api.patch(`/api/tracks/${editing.id}`, updates);
      await loadTracks();
      closeEdit();
      window.dispatchEvent(new Event('tracks:refresh'));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(track: Track) {
    if (!confirm(`Delete "${track.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/tracks/${track.id}`);
      await loadTracks();
      window.dispatchEvent(new Event('tracks:refresh'));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        DASHBOARD — {user.display_name}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Upload Section */}
          <div className="mb-10">
            <h2 className="text-sm font-bold text-zinc-100 tracking-widest font-mono mb-2">
              UPLOAD NEW TRACK
            </h2>
            <p className="text-[10px] font-mono text-zinc-600 leading-relaxed mb-4">
              File disimpan ke Solid Pod Anda.<br />
              Metadata akan dibaca oleh indexer publik.
            </p>
            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <UploadForm />
            </div>
          </div>

          {/* My Tracks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-100 tracking-widest font-mono">
                MY TRACKS ({tracks.length})
              </h2>
              <button
                onClick={loadTracks}
                className="text-[10px] font-mono text-zinc-500 hover:text-accent transition-colors"
              >
                REFRESH
              </button>
            </div>

            {loadingTracks ? (
              <div className="text-[10px] font-mono text-zinc-600">LOADING...</div>
            ) : tracks.length === 0 ? (
              <div className="text-[10px] font-mono text-zinc-600 leading-relaxed border border-zinc-800 p-6 text-center">
                NO TRACKS YET.
                <br />
                <span className="text-zinc-700">Upload your first track above.</span>
              </div>
            ) : (
              <div className="border border-zinc-800">
                {tracks.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-4 p-3 ${
                      i < tracks.length - 1 ? 'border-b border-zinc-800' : ''
                    }`}
                  >
                    {/* Cover thumbnail */}
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <span className="text-zinc-700 font-mono text-[10px] font-bold">
                        {t.title.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/tracks/${t.id}`}
                        className="text-sm font-bold text-zinc-100 hover:text-accent truncate block transition-colors"
                      >
                        {t.title}
                      </Link>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        {t.artist_name} · {t.stream_access.toUpperCase()}
                        {t.status && t.status !== 'available' && (
                          <span className="text-accent ml-2">[{t.status.toUpperCase()}]</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 shrink-0">
                      <span>♥ {t.like_count || 0}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-accent border border-zinc-800 hover:border-accent px-2 py-1 transition-colors"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-accent border border-zinc-800 hover:border-accent px-2 py-1 transition-colors"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && editForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-zinc-950 border border-zinc-700 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="text-[10px] font-mono text-zinc-400 tracking-widest">
                EDIT TRACK
              </div>
              <button
                onClick={closeEdit}
                className="text-zinc-500 hover:text-accent text-xs font-mono"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                  TITLE
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                  ARTIST
                </label>
                <input
                  type="text"
                  value={editForm.artist_name}
                  onChange={(e) => setEditForm({ ...editForm, artist_name: e.target.value })}
                  required
                  className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                  GENRE (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.genre}
                  onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  placeholder="Indie Rock, Emo"
                  className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100 placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                  DESCRIPTION
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100 resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                  STREAM ACCESS
                </label>
                <select
                  value={editForm.stream_access}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stream_access: e.target.value as EditForm['stream_access'],
                    })
                  }
                  className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
                >
                  <option value="free">FREE (anyone can play)</option>
                  <option value="login_required">LOGIN REQUIRED</option>
                  <option value="paid">PAID (coming Week 3)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="download_enabled"
                  checked={editForm.download_enabled}
                  onChange={(e) =>
                    setEditForm({ ...editForm, download_enabled: e.target.checked })
                  }
                  className="accent-accent"
                />
                <label
                  htmlFor="download_enabled"
                  className="text-[10px] font-mono text-zinc-400"
                >
                  ENABLE DOWNLOAD
                </label>
              </div>

              {editForm.download_enabled && (
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 block mb-1 tracking-widest">
                    DOWNLOAD PRICE (IDR, 0 = free)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.download_price_cents}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        download_price_cents: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-transparent border border-zinc-800 text-xs px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-100"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tip_enabled"
                  checked={editForm.tip_enabled}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tip_enabled: e.target.checked })
                  }
                  className="accent-accent"
                />
                <label htmlFor="tip_enabled" className="text-[10px] font-mono text-zinc-400">
                  ALLOW TIPS
                </label>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 text-[10px] font-mono border border-zinc-800 text-zinc-400 hover:border-zinc-600 py-2 tracking-widest transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 text-[10px] font-mono bg-zinc-50 text-zinc-950 hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed py-2 font-bold tracking-widest transition-colors"
                >
                  {saving ? 'SAVING...' : 'SAVE'}
                </button>
              </div>

              <div className="text-[9px] font-mono text-zinc-600 leading-relaxed mt-2 pt-2 border-t border-zinc-800">
                Note: Perubahan hanya update katalog index.<br />
                Pod metadata sync coming soon.
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
