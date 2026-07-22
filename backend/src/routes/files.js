import { Router } from 'express';
import * as fileController from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);
router.get('/', authenticate, fileController.listFiles);
router.get('/:id', authenticate, fileController.getFile);
router.get('/:id/download', authenticate, fileController.downloadFile);
router.delete('/:id', authenticate, fileController.deleteFile);

export default router;
