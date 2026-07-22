import { Router } from 'express';
import * as notificationPrefController from '../controllers/notificationPrefController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, notificationPrefController.getPreferences);
router.put('/', authenticate, notificationPrefController.updatePreferences);

export default router;
