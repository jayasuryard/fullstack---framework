import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), adminController.getDashboardStats);
router.get('/user-analytics', authenticate, authorize('SUPER_ADMIN'), adminController.getUserAnalytics);

export default router;
