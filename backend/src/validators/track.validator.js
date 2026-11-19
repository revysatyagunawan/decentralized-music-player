import { z } from 'zod';

export const syncSchema = z.object({
  pod_resource_url: z.string().url(),
});

export const metadataSchema = z.object({
  '@context': z.union([z.string(), z.object({}).passthrough()]),
  '@type': z.literal('MusicRecording'),
  '@id': z.string().url(),
  name: z.string().min(1).max(500),
  byArtist: z.object({
    '@id': z.string().url(),
    name: z.string().optional(),
  }),
  contentUrl: z.string().url(),
  duration: z.string().regex(/^PT(\d+H)?(\d+M)?(\d+S)?$/),
  genre: z.union([z.string(), z.array(z.string())]).optional(),
  description: z.string().max(5000).optional(),
  image: z.string().url().optional(),
  datePublished: z.string().optional(),
  isrcCode: z.string().max(12).optional(),
  musicbrainzRecordingId: z.string().uuid().optional(),
});

export const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  artist_name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  genre: z.array(z.string().min(1).max(50)).nullable().optional(),
  stream_access: z.enum(['free', 'login_required', 'paid']).optional(),
  download_enabled: z.boolean().optional(),
  download_price_cents: z.number().int().min(0).optional(),
  download_currency: z.string().length(3).optional(),
  tip_enabled: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});
