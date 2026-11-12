import { useEffect, useState } from 'react';
import { api, Track } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';

interface Props {
  webid: string;
  onBack: () => void;
}

interface Profile {
  webid: string;
  display_name: string;
  bio: string | null;
  track_count: number;
  follower_count: number;
  is_following: boolean;
  is_self: boolean;
}

export function ArtistProfile({ webid, onBack }: Props) {
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(webid);
      const [profileRes, tracksRes] = await Promise.all([
        api.get(`/api/artists/${encoded}`),
        api.get(`/api/artists/${encoded}/tracks`),
      ]);
      setProfile(profileRes.data.data);
      setTracks(tracksRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [webid]);

  async function toggleFollow() {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      const encoded = encodeURIComponent(webid);
      if (profile.is_following) {
        await api.delete(`/api/users/${encoded}/follow`);
        setProfile({
          ...profile,
          is_following: false,
          follower_count: Math.max(0, profile.follower_count - 1),
        });
      } else {
        await api.post(`/api/users/${encoded}/follow`);
        setProfile({
          ...profile,
          is_following: true,
          follower_count: profile.follower_count + 1,
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return <div className="text-zinc-500 font-mono text-xs">FETCHING ARTIST...</div>;
  }

  if (!profile) {
    return <div className="text-zinc-500 font-mono text-xs">ARTIST NOT FOUND.</div>;
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-[10px] font-mono text-zinc-500 hover:text-accent mb-4 transition-colors"
      >
        ← BACK TO LIBRARY
      </button>

      {/* Profile header */}
      <div className="flex items-start gap-6 mb-6 pb-6 border-b border-zinc-800">
        <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
          <span className="text-zinc-700 font-mono text-3xl font-bold">
            {profile.display_name.substring(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-1">
            ARTIST
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            {profile.display_name}
          </h2>
          <div className="text-[11px] font-mono text-zinc-500 truncate mb-3" title={profile.webid}>
            {profile.webid}
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>
              <span className="text-zinc-100 font-bold">{profile.track_count}</span> TRACKS
            </span>
            <span>
              <span className="text-zinc-100 font-bold">{profile.follower_count}</span> FOLLOWERS
            </span>
            {profile.bio && (
              <span className="text-zinc-500 truncate" title={profile.bio}>
                {profile.bio}
              </span>
            )}
          </div>

          {user && !profile.is_self && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`mt-4 text-[10px] font-mono px-4 py-2 border transition-colors tracking-widest disabled:opacity-50 ${
                profile.is_following
                  ? 'border-zinc-700 text-zinc-400 hover:border-accent hover:text-accent'
                  : 'border-zinc-50 bg-zinc-50 text-zinc-950 hover:bg-accent hover:border-accent hover:text-white'
              }`}
            >
              {followLoading
                ? 'WORKING...'
                : profile.is_following
                ? 'UNFOLLOW'
                : 'FOLLOW'}
            </button>
          )}

          {profile.is_self && (
            <div className="mt-4 text-[10px] font-mono text-zinc-600 tracking-widest">
              [ THIS IS YOU ]
            </div>
          )}
        </div>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="text-zinc-500 font-mono text-xs">
          NO TRACKS YET.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  <span
                    className={`font-bold text-xs leading-tight truncate ${
                      isCurrent ? 'text-accent' : 'text-zinc-100'
                    }`}
                  >
                    {t.title}
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
      )}
    </div>
  );
}
