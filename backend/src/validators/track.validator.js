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
