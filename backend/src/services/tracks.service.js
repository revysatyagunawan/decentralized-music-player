import * as trackRepo from '../repositories/track.repo.js';
import * as solidService from './solid.service.js';
import { metadataSchema } from '../validators/track.validator.js';
import { errors } from '../utils/errors.js';

export async function listTracks({ limit, offset, sort }) {
  const [tracks, total] = await Promise.all([
    trackRepo.findPublic(limit, offset, sort),
    trackRepo.countPublic(),
  ]);
  return { tracks, total };
}

export async function getTrackById(id) {
  const track = await trackRepo.findById(id);
  if (!track) throw errors.notFound('track_not_found', 'Track not found');

  // Week 1: semua stream_access default 'free' → selalu allowed
  // (logika login_required/paid masuk di Minggu 2)
  return {
    ...track,
    stream_allowed: track.stream_access === 'free',
    audio_url: track.stream_access === 'free' ? track.audio_url : null,
  };
}

function parseDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const [, h, min, s] = m;
  return (
    parseInt(h || '0', 10) * 3600 +
    parseInt(min || '0', 10) * 60 +
    parseInt(s || '0', 10)
  );
}

export async function syncFromPod(podResourceUrl, user) {
  const raw = await solidService.fetchMetadata(podResourceUrl);

  const parsed = metadataSchema.safeParse(raw);
  if (!parsed.success) {
    throw errors.validation({
      reason: 'invalid_metadata',
      fields: parsed.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  const meta = parsed.data;

  // WebID normalization: strip trailing slash untuk perbandingan
  const normalizedOwner = meta.byArtist['@id'].replace(/\/$/, '');
  if (normalizedOwner !== user.webid) {
    throw errors.forbidden('You can only publish tracks owned by your WebID');
  }

  const genreArray = meta.genre
    ? Array.isArray(meta.genre)
      ? meta.genre
      : [meta.genre]
    : null;

  return await trackRepo.upsertFromPod({
    owner_id: user.userId,
    owner_webid: user.webid,
    pod_resource_url: podResourceUrl,
    audio_url: meta.contentUrl,
    cover_url: meta.image || null,
    title: meta.name,
    artist_name: meta.byArtist.name || user.webid,
    description: meta.description || null,
    genre: genreArray,
    duration_seconds: parseDuration(meta.duration),
    musicbrainz_recording_id: meta.musicbrainzRecordingId || null,
    isrc_code: meta.isrcCode || null,
  });
}
