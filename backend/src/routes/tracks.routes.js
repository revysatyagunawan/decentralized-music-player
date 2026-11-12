import { Router } from 'express';
import { z } from 'zod';
import * as tracksController from '../controllers/tracks.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { syncSchema } from '../validators/track.validator.js';

const router = Router();

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['created_at:desc', 'created_at:asc', 'title:asc']).default('created_at:desc'),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

router.get('/', validate(listQuerySchema, 'query'), tracksController.listTracks);
router.get('/search', validate(searchQuerySchema, 'query'), tracksController.searchTracks);
router.post('/sync', requireAuth, validate(syncSchema, 'body'), tracksController.syncTrack);
router.get('/:id', validate(idParamSchema, 'params'), tracksController.getTrackById);

export default router;
