import { Router } from 'express';
import { z } from 'zod';
import * as commentController from '../controllers/comment.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const idParam = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const createBody = z.object({
  content: z.string().min(1).max(2000),
});

router.get(
  '/tracks/:id/comments',
  optionalAuth,
  validate(idParam, 'params'),
  validate(listQuery, 'query'),
  commentController.list,
);
router.post(
  '/tracks/:id/comments',
  requireAuth,
  validate(idParam, 'params'),
  validate(createBody, 'body'),
  commentController.create,
);
router.delete(
  '/comments/:id',
  requireAuth,
  validate(idParam, 'params'),
  commentController.remove,
);

export default router;
