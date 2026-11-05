import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { exchangeSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/solid/exchange', validate(exchangeSchema, 'body'), authController.exchange);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;
