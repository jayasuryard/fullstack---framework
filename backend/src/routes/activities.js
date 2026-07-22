import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, activityController.listActivities);

export default router;
