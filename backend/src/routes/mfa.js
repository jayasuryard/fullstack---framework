import { Router } from 'express';
import * as mfaController from '../controllers/mfaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/generate', authenticate, mfaController.generate);
router.post('/enable', authenticate, mfaController.enable);
router.post('/disable', authenticate, mfaController.disable);
router.post('/send-otp', mfaController.sendOtp);
router.post('/verify-otp', authenticate, mfaController.verifyOtp);

export default router;
