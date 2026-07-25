import { Router } from 'express';
import * as billingController from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/plans', billingController.listPlans);
router.post('/subscribe', authenticate, billingController.subscribe);
router.get('/subscription', authenticate, billingController.getSubscription);
router.post('/subscription/:id/cancel', authenticate, billingController.cancelSubscription);
router.get('/invoices', authenticate, billingController.listInvoices);
router.get('/usage', authenticate, billingController.getUsage);

export default router;
