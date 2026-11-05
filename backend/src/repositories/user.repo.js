import { pool } from '../db/pool.js';

export async function upsertByWebId(webid, displayName) {
  const { rows } = await pool.query(
    `INSERT INTO users (webid, display_name)
     VALUES ($1, $2)
     ON CONFLICT (webid) DO UPDATE
     SET display_name = CASE
           WHEN users.display_name = '' THEN EXCLUDED.display_name
           ELSE users.display_name
         END,
         updated_at = now()
     RETURNING id, webid, display_name, bio, avatar_url, created_at`,
    [webid, displayName]
  );
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, webid, display_name, bio, avatar_url, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}
