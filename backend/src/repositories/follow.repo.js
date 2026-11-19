import { pool } from '../db/pool.js';

export async function follow(followerId, followerWebid, followedWebid) {
  const { rows } = await pool.query(
    `INSERT INTO follows (follower_id, follower_webid, followed_webid)
     VALUES ($1, $2, $3)
     ON CONFLICT (follower_id, followed_webid) DO NOTHING
     RETURNING *`,
    [followerId, followerWebid, followedWebid],
  );
  return rows[0] || null;
}

export async function unfollow(followerId, followedWebid) {
  const { rowCount } = await pool.query(
    `DELETE FROM follows WHERE follower_id = $1 AND followed_webid = $2`,
    [followerId, followedWebid],
  );
  return rowCount > 0;
}

export async function isFollowing(followerId, followedWebid) {
  const { rows } = await pool.query(
    `SELECT 1 FROM follows WHERE follower_id = $1 AND followed_webid = $2`,
    [followerId, followedWebid],
  );
  return rows.length > 0;
}

export async function countFollowers(webid) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM follows WHERE followed_webid = $1`,
    [webid],
  );
  return rows[0].total;
}
