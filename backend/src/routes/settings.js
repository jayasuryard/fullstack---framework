import { Router } from 'express';
import * as settingController from '../controllers/settingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), settingController.getSettings);
router.get('/:key', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), settingController.getSetting);
router.put('/:key', authenticate, authorize('SUPER_ADMIN'), settingController.updateSetting);

export default router;
