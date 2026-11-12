import { Router } from 'express';
import { z } from 'zod';
import * as likeController from '../controllers/like.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const idParam = z.object({ id: z.string().uuid() });

router.post(
  '/tracks/:id/likes',
  requireAuth,
  validate(idParam, 'params'),
  likeController.like,
);
router.delete(
  '/tracks/:id/likes',
  requireAuth,
  validate(idParam, 'params'),
  likeController.unlike,
);

export default router;
