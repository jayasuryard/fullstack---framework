import { Router } from 'express';
import * as conversationController from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, conversationController.create);
router.get('/', authenticate, conversationController.list);
router.get('/:id', authenticate, conversationController.get);
router.delete('/:id', authenticate, conversationController.remove);
router.post('/:id/messages', authenticate, conversationController.sendMessage);
router.post('/:id/stream', authenticate, conversationController.streamMessage);

export default router;
