import { Router } from 'express';
import { z } from 'zod';
import authRoutes from './auth.routes.js';
import tracksRoutes from './tracks.routes.js';
import * as tracksController from '../controllers/tracks.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.get('/search', validate(searchQuerySchema, 'query'), tracksController.searchTracks);

export default router;
