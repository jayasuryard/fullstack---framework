import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, searchController.search);

export default router;
