import { Router } from 'express';
import * as emailVerificationController from '../controllers/emailVerificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/send', authenticate, emailVerificationController.sendVerification);
router.post('/verify', emailVerificationController.verifyEmail);

export default router;
