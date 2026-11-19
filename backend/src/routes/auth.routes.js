import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyDpopToken } from '../middlewares/dpop.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/solid/exchange', verifyDpopToken, authController.exchange);
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;
