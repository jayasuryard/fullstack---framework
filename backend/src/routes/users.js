import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updatePasswordSchema } from '../validators/users.js';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.listUsers);
router.get('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.getUser);
router.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), userController.updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), userController.deleteUser);

export default router;
