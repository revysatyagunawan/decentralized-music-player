import * as commentRepo from '../repositories/comment.repo.js';
import * as trackRepo from '../repositories/track.repo.js';
import { errors } from '../utils/errors.js';

function deriveName(webid) {
  try {
    return new URL(webid).hostname.split('.')[0];
  } catch {
    return 'User';
  }
}

export async function listComments(trackId, currentUser, { limit, offset }) {
  const track = await trackRepo.findById(trackId);
  if (!track) throw errors.notFound('track_not_found', 'Track not found');

  const [rows, total] = await Promise.all([
    commentRepo.findByTrack(trackId, limit, offset),
    commentRepo.countByTrack(trackId),
  ]);

  return {
    comments: rows.map((c) => ({
      id: c.id,
      user_webid: c.user_webid,
      display_name: c.display_name || deriveName(c.user_webid),
      content: c.content,
      created_at: c.created_at,
      is_owner: currentUser ? currentUser.webid === c.user_webid : false,
    })),
    total,
  };
}

export async function addComment(trackId, user, content) {
  const track = await trackRepo.findById(trackId);
  if (!track) throw errors.notFound('track_not_found', 'Track not found');

  const row = await commentRepo.create(trackId, user.userId, user.webid, content);
  return {
    id: row.id,
    user_webid: row.user_webid,
    display_name: user.display_name || deriveName(row.user_webid),
    content: row.content,
    created_at: row.created_at,
    is_owner: true,
  };
}

export async function deleteComment(id, user) {
  const existing = await commentRepo.findById(id);
  if (!existing) throw errors.notFound('comment_not_found', 'Comment not found');
  if (existing.user_webid !== user.webid) {
    throw errors.forbidden('Can only delete your own comments');
  }
  await commentRepo.remove(id);
  return { deleted: true };
}
