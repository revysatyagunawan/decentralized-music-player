import { Router } from 'express';
import { z } from 'zod';
import * as tracksController from '../controllers/tracks.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { syncSchema, updateSchema } from '../validators/track.validator.js';

const router = Router();

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['created_at:desc', 'created_at:asc', 'title:asc']).default('created_at:desc'),
});

const idParamSchema = z.object({ id: z.string().uuid() });

router.get('/', optionalAuth, validate(listQuerySchema, 'query'), tracksController.listTracks);
router.get('/mine', requireAuth, tracksController.listMine);
router.post('/sync', requireAuth, validate(syncSchema, 'body'), tracksController.syncTrack);
router.patch(
  '/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(updateSchema, 'body'),
  tracksController.updateTrack,
);
router.delete(
  '/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  tracksController.deleteTrack,
);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), tracksController.getTrackById);

export default router;
