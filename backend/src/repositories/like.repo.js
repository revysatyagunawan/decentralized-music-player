import { pool } from '../db/pool.js';

export async function addLike(userId, userWebid, trackId) {
  const { rowCount } = await pool.query(
    `INSERT INTO likes (user_id, user_webid, track_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, track_id) DO NOTHING`,
    [userId, userWebid, trackId],
  );
  return rowCount > 0;
}

export async function removeLike(userId, trackId) {
  const { rowCount } = await pool.query(
    `DELETE FROM likes WHERE user_id = $1 AND track_id = $2`,
    [userId, trackId],
  );
  return rowCount > 0;
}

export async function countByTrack(trackId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM likes WHERE track_id = $1`,
    [trackId],
  );
  return rows[0].count;
}

export async function countByTracks(trackIds) {
  if (trackIds.length === 0) return {};
  const { rows } = await pool.query(
    `SELECT track_id, COUNT(*)::int AS count
     FROM likes
     WHERE track_id = ANY($1::uuid[])
     GROUP BY track_id`,
    [trackIds],
  );
  const map = {};
  for (const row of rows) map[row.track_id] = row.count;
  return map;
}

export async function getLikedTrackIds(userId, trackIds) {
  if (trackIds.length === 0) return new Set();
  const { rows } = await pool.query(
    `SELECT track_id FROM likes
     WHERE user_id = $1 AND track_id = ANY($2::uuid[])`,
    [userId, trackIds],
  );
  return new Set(rows.map((r) => r.track_id));
}
