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

export async function findByOwner(webid, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    `SELECT id, title, artist_name, owner_webid, cover_url, duration_seconds,
            genre, stream_access, audio_url, status, created_at
     FROM tracks
     WHERE owner_webid = $1
       AND deleted_at IS NULL
       AND visibility = 'public'
       AND status = 'available'
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [webid, limit, offset],
  );
  return rows;
}

export async function countByOwner(webid) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM tracks
     WHERE owner_webid = $1
       AND deleted_at IS NULL
       AND visibility = 'public'
       AND status = 'available'`,
    [webid],
  );
  return rows[0].total;
}

export async function search(query, limit = 20, offset = 0) {
  const sanitized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(' & ');

  if (!sanitized) return [];

  const { rows } = await pool.query(
    `SELECT id, title, artist_name, owner_webid, cover_url, duration_seconds,
            genre, stream_access, audio_url, status, created_at,
            ts_rank(search_vector, to_tsquery('simple', $1)) AS rank
     FROM tracks
     WHERE deleted_at IS NULL AND visibility = 'public' AND status = 'available'
       AND (
         search_vector @@ to_tsquery('simple', $1)
         OR title ILIKE '%' || $4 || '%'
         OR artist_name ILIKE '%' || $4 || '%'
       )
     ORDER BY rank DESC NULLS LAST, created_at DESC
     LIMIT $2 OFFSET $3`,
    [sanitized, limit, offset, query],
  );
  return rows;
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

export async function findByOwnerId(ownerId) {
  const { rows } = await pool.query(
    `SELECT id, title, artist_name, owner_webid, cover_url, duration_seconds,
            genre, stream_access, download_enabled, download_price_cents,
            download_currency, tip_enabled, visibility, status,
            audio_url, created_at
     FROM tracks
     WHERE owner_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [ownerId],
  );
  return rows;
}

export async function updateTrack(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = [
    'title',
    'artist_name',
    'description',
    'genre',
    'stream_access',
    'download_enabled',
    'download_price_cents',
    'download_currency',
    'tip_enabled',
    'visibility',
  ];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE tracks
     SET ${fields.join(', ')}, updated_at = now()
     WHERE id = $${idx} AND deleted_at IS NULL
     RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function softDelete(id) {
  const { rowCount } = await pool.query(
    `UPDATE tracks
     SET deleted_at = now(), status = 'deleted', updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return rowCount > 0;
}
