import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/chat', authenticate, aiController.chat);
router.post('/stream', authenticate, aiController.streamChat);

export default router;
