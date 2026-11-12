import { Router } from 'express';
import { z } from 'zod';
import * as artistController from '../controllers/artist.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const webidParam = z.object({
  webid: z.string().min(1),
});

const tracksQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get(
  '/artists/:webid',
  optionalAuth,
  validate(webidParam, 'params'),
  artistController.getProfile,
);
router.get(
  '/artists/:webid/tracks',
  validate(webidParam, 'params'),
  validate(tracksQuery, 'query'),
  artistController.getTracks,
);
router.post(
  '/users/:webid/follow',
  requireAuth,
  validate(webidParam, 'params'),
  artistController.follow,
);
router.delete(
  '/users/:webid/follow',
  requireAuth,
  validate(webidParam, 'params'),
  artistController.unfollow,
);

export default router;
