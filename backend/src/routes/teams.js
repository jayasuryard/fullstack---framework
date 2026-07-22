import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, teamController.create);
router.get('/', authenticate, teamController.list);
router.get('/:id', authenticate, teamController.get);
router.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), teamController.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), teamController.remove);
router.post('/:id/members', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), teamController.addMember);
router.delete('/:id/members/:memberId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), teamController.removeMember);

export default router;
