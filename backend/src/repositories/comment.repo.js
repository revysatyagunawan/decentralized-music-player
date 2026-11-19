import { pool } from '../db/pool.js';

export async function findByTrack(trackId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT c.id, c.user_webid, c.content, c.created_at,
            u.display_name
     FROM comments c
     LEFT JOIN users u ON u.webid = c.user_webid
     WHERE c.track_id = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [trackId, limit, offset],
  );
  return rows;
}

export async function countByTrack(trackId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM comments WHERE track_id = $1`,
    [trackId],
  );
  return rows[0].total;
}

export async function create(trackId, userId, userWebid, content) {
  const { rows } = await pool.query(
    `INSERT INTO comments (track_id, user_id, user_webid, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_webid, content, created_at`,
    [trackId, userId, userWebid, content],
  );
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, user_id, user_webid, track_id FROM comments WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM comments WHERE id = $1`,
    [id],
  );
  return rowCount > 0;
}
