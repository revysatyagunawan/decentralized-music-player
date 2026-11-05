CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- USERS
CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webid        TEXT NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    bio          TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_webid ON users (webid);

-- TRACKS
CREATE TYPE track_status AS ENUM
    ('available', 'unavailable', 'unknown', 'deleted', 'access_revoked', 'hidden_by_admin');
CREATE TYPE stream_access_mode AS ENUM
    ('free', 'login_required', 'paid');

CREATE TABLE tracks (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_webid              TEXT NOT NULL,
    pod_resource_url         TEXT NOT NULL UNIQUE,
    audio_url                TEXT NOT NULL,
    cover_url                TEXT,
    title                    TEXT NOT NULL,
    artist_name              TEXT NOT NULL,
    description              TEXT,
    genre                    TEXT[],
    duration_seconds         INTEGER,
    musicbrainz_recording_id UUID,
    isrc_code                VARCHAR(12),
    stream_access            stream_access_mode NOT NULL DEFAULT 'free',
    download_enabled         BOOLEAN NOT NULL DEFAULT false,
    download_price_cents     INTEGER NOT NULL DEFAULT 0,
    download_currency        VARCHAR(3) NOT NULL DEFAULT 'IDR',
    tip_enabled              BOOLEAN NOT NULL DEFAULT true,
    visibility               VARCHAR(20) NOT NULL DEFAULT 'public'
                             CHECK (visibility IN ('public','private','unlisted')),
    status                   track_status NOT NULL DEFAULT 'unknown',
    last_verified_at         TIMESTAMPTZ,
    source_updated_at        TIMESTAMPTZ,
    synced_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at               TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tracks_owner      ON tracks (owner_id);
CREATE INDEX idx_tracks_status_pub ON tracks (status, visibility) WHERE deleted_at IS NULL;
CREATE INDEX idx_tracks_genre      ON tracks USING GIN (genre);
CREATE INDEX idx_tracks_search     ON tracks USING GIN (to_tsvector('simple', title || ' ' || artist_name));

-- FOLLOWS
CREATE TABLE follows (
    follower_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follower_webid TEXT NOT NULL,
    followed_webid TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, followed_webid)
);
CREATE INDEX idx_follows_followed ON follows (followed_webid);

-- LIKES
CREATE TABLE likes (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_webid TEXT NOT NULL,
    track_id   UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, track_id)
);
CREATE INDEX idx_likes_track ON likes (track_id);

-- COMMENTS
CREATE TABLE comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_webid TEXT NOT NULL,
    track_id   UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_track ON comments (track_id, created_at DESC);

-- PLAYLISTS
CREATE TABLE playlists (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_webid TEXT NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    visibility  VARCHAR(20) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private','public','unlisted')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_playlists_owner ON playlists (owner_id);

CREATE TABLE playlist_tracks (
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id    UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (playlist_id, track_id)
);
CREATE INDEX idx_playlist_tracks_pos ON playlist_tracks (playlist_id, position);

-- POSTS
CREATE TABLE posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_webid TEXT NOT NULL,
    content      TEXT,
    media_url    TEXT,
    track_id     UUID REFERENCES tracks(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_author ON posts (author_id, created_at DESC);

-- COLLECTIONS
CREATE TABLE collections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_webid TEXT NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    visibility  VARCHAR(20) NOT NULL DEFAULT 'public'
                CHECK (visibility IN ('public','private','unlisted')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_tracks (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    track_id      UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL,
    added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, track_id)
);

-- REVIEWS
CREATE TABLE reviews (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_webid TEXT NOT NULL,
    track_id   UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, track_id)
);

-- PURCHASES
CREATE TABLE purchases (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id           UUID REFERENCES tracks(id) ON DELETE SET NULL,
    recipient_webid    TEXT,
    buyer_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    buyer_webid        TEXT,
    guest_email        TEXT,
    type               VARCHAR(20) NOT NULL
                       CHECK (type IN ('download','stream_unlock','tip','bundle')),
    unlocks_stream     BOOLEAN NOT NULL DEFAULT false,
    stream_unlocked_at TIMESTAMPTZ,
    amount_cents       INTEGER NOT NULL,
    currency           VARCHAR(3) NOT NULL DEFAULT 'IDR',
    gateway            VARCHAR(30) NOT NULL,
    gateway_ref        TEXT,
    status             VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','paid','failed','refunded')),
    download_token     TEXT,
    token_expires_at   TIMESTAMPTZ,
    email_sent_at      TIMESTAMPTZ,
    paid_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT buyer_or_guest CHECK (buyer_id IS NOT NULL OR guest_email IS NOT NULL)
);
CREATE INDEX idx_purchases_buyer  ON purchases (buyer_id);
CREATE INDEX idx_purchases_track  ON purchases (track_id);
CREATE INDEX idx_purchases_status ON purchases (status) WHERE status = 'pending';

-- REPORTS
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(20) NOT NULL
                CHECK (target_type IN ('track','comment','user','post')),
    target_id   UUID NOT NULL,
    reason      TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','resolved','dismissed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_reports_status ON reports (status) WHERE status = 'open';

-- EVENTS (telemetry)
CREATE TABLE events (
    id         BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(30) NOT NULL,
    user_id    UUID,
    track_id   UUID,
    metadata   JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_track     ON events (track_id, created_at DESC);
CREATE INDEX idx_events_type_time ON events (event_type, created_at DESC);
