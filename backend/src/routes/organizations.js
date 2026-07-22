import { Router } from 'express';
import * as organizationController from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, organizationController.create);
router.get('/', authenticate, organizationController.list);
router.post('/accept-invitation', authenticate, organizationController.acceptInvitation);
router.get('/:id', authenticate, organizationController.get);
router.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), organizationController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), organizationController.remove);
router.post('/:id/invite', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), organizationController.invite);
router.delete('/:id/members/:memberId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), organizationController.removeMember);

export default router;
