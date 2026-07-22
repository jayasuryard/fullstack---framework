import { Router } from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), auditLogController.listAuditLogs);

export default router;
