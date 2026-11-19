import * as likeRepo from '../repositories/like.repo.js';
import * as trackRepo from '../repositories/track.repo.js';
import { errors } from '../utils/errors.js';

export async function likeTrack(user, trackId) {
  const track = await trackRepo.findById(trackId);
  if (!track) throw errors.notFound('track_not_found', 'Track not found');

  const inserted = await likeRepo.addLike(user.userId, user.webid, trackId);
  const count = await likeRepo.countByTrack(trackId);

  return {
    liked: true,
    already_liked: !inserted,
    like_count: count,
  };
}

export async function unlikeTrack(user, trackId) {
  const removed = await likeRepo.removeLike(user.userId, trackId);
  const count = await likeRepo.countByTrack(trackId);
  return {
    liked: false,
    was_liked: removed,
    like_count: count,
  };
}

export async function enrichTracksWithLikes(tracks, user) {
  if (tracks.length === 0) return [];
  const ids = tracks.map((t) => t.id);

  const [counts, likedSet] = await Promise.all([
    likeRepo.countByTracks(ids),
    user?.userId
      ? likeRepo.getLikedTrackIds(user.userId, ids)
      : Promise.resolve(new Set()),
  ]);

  return tracks.map((t) => ({
    ...t,
    like_count: counts[t.id] || 0,
    is_liked: likedSet.has(t.id),
  }));
}
