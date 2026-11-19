import * as userRepo from '../repositories/user.repo.js';
import * as trackRepo from '../repositories/track.repo.js';
import * as followRepo from '../repositories/follow.repo.js';
import { errors } from '../utils/errors.js';

function enrichTrack(track) {
  const allowed = track.stream_access === 'free';
  return {
    ...track,
    stream_allowed: allowed,
    audio_url: allowed ? track.audio_url : null,
  };
}

export async function getArtistProfile(webid, currentUser) {
  const user = await userRepo.findByWebId(webid);

  const [trackCount, followerCount] = await Promise.all([
    trackRepo.countByOwner(webid),
    followRepo.countFollowers(webid),
  ]);

  let isFollowing = false;
  let isSelf = false;
  if (currentUser) {
    isSelf = currentUser.webid === webid;
    if (!isSelf) {
      isFollowing = await followRepo.isFollowing(currentUser.userId, webid);
    }
  }

  const base = user
    ? {
        webid: user.webid,
        display_name: user.display_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
      }
    : {
        webid,
        display_name: webid.split('/')[2] || 'Unknown Artist',
        bio: null,
        avatar_url: null,
      };

  return {
    ...base,
    track_count: trackCount,
    follower_count: followerCount,
    is_following: isFollowing,
    is_self: isSelf,
  };
}

export async function getArtistTracks(webid, { limit, offset }) {
  const [tracks, total] = await Promise.all([
    trackRepo.findByOwner(webid, limit, offset),
    trackRepo.countByOwner(webid),
  ]);
  return { tracks: tracks.map(enrichTrack), total };
}

export async function followArtist(followerUser, followedWebid) {
  if (followerUser.webid === followedWebid) {
    throw errors.validation({ reason: 'cannot_follow_self' });
  }
  const result = await followRepo.follow(
    followerUser.userId,
    followerUser.webid,
    followedWebid,
  );
  if (!result) {
    throw errors.conflict('already_following', 'Already following this artist');
  }
  return { following: true };
}

export async function unfollowArtist(followerUser, followedWebid) {
  const removed = await followRepo.unfollow(
    followerUser.userId,
    followedWebid,
  );
  if (!removed) {
    throw errors.notFound('not_following', 'Not following this artist');
  }
  return { following: false };
}
