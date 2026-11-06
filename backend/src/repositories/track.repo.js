import { pool } from '../db/pool.js';

const SELECT_PUBLIC = `
  SELECT id, title, artist_name, owner_webid, cover_url, duration_seconds,
         genre, stream_access, download_enabled, download_price_cents,
         download_currency, audio_url, status, created_at
  FROM tracks
  WHERE deleted_at IS NULL AND visibility = 'public' AND status = 'available'
`;

export async function findPublic(limit, offset, sort) {
  const [column, direction] = sort.split(':');
  const allowedCols = ['created_at', 'title'];
  const allowedDirs = ['asc', 'desc'];
  const col = allowedCols.includes(column) ? column : 'created_at';
  const dir = allowedDirs.includes(direction) ? direction.toUpperCase() : 'DESC';

  const { rows } = await pool.query(
    `${SELECT_PUBLIC} ORDER BY ${col} ${dir} LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function countPublic() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM tracks
     WHERE deleted_at IS NULL AND visibility = 'public' AND status = 'available'`,
  );
  return rows[0].total;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM tracks WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return rows[0] || null;
}

export async function upsertFromPod(data) {
  const { rows } = await pool.query(
    `INSERT INTO tracks (
       owner_id, owner_webid, pod_resource_url, audio_url, cover_url,
       title, artist_name, description, genre, duration_seconds,
       musicbrainz_recording_id, isrc_code, status, synced_at, source_updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'available',now(),now())
     ON CONFLICT (pod_resource_url) DO UPDATE SET
       audio_url = EXCLUDED.audio_url,
       cover_url = EXCLUDED.cover_url,
       title = EXCLUDED.title,
       artist_name = EXCLUDED.artist_name,
       description = EXCLUDED.description,
       genre = EXCLUDED.genre,
       duration_seconds = EXCLUDED.duration_seconds,
       musicbrainz_recording_id = EXCLUDED.musicbrainz_recording_id,
       isrc_code = EXCLUDED.isrc_code,
       status = 'available',
       synced_at = now(),
       source_updated_at = now(),
       deleted_at = NULL,
       updated_at = now()
     RETURNING *`,
    [
      data.owner_id,
      data.owner_webid,
      data.pod_resource_url,
      data.audio_url,
      data.cover_url,
      data.title,
      data.artist_name,
      data.description,
      data.genre,
      data.duration_seconds,
      data.musicbrainz_recording_id,
      data.isrc_code,
    ],
  );
  return rows[0];
}
