import { Router } from 'express';
import * as oauthController from '../controllers/oauthController.js';

const router = Router();

router.get('/providers', oauthController.listProviders);
router.get('/:provider', oauthController.initiateOAuth);
router.get('/:provider/callback', oauthController.handleOAuthCallback);

export default router;
