-- Fungsi wrapper immutable untuk array_to_string
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT array_to_string(arr, sep);
$$;

-- Tambah generated column yang pakai wrapper immutable
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(artist_name, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(immutable_array_to_string(genre, ' '), '')), 'C')
) STORED;

-- Index GIN untuk performa search
CREATE INDEX IF NOT EXISTS idx_tracks_search ON tracks USING GIN(search_vector);
