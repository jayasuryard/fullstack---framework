/**
 * Auth routes.
 *
 * POST /common/auth/login
 * POST /common/auth/refresh
 * GET  /common/auth/me
 * POST /common/auth/logout
 * POST /common/auth/forgot-password
 * POST /common/auth/reset-password
 */
const express     = require('express');
const router      = express.Router();
const verifyToken = require('../../../middleware/verifyToken');
const { loginLimiter, otpSendLimiter, refreshLimiter } = require('../../../middleware/rateLimit.js');
const { validateBody, z } = require('../../../middleware/validate');
const { validatedUpload } = require('../../../middleware/upload.js');
const {
  login,
  refreshToken,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../services/AuthService');

const loginSchema   = z.object({
  userName: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});
const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
const forgotSchema  = z.object({
  email: z.string().trim().email().max(255),
});
const resetSchema   = z.object({
  email:        z.string().trim().email().max(255),
  otp:          z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword:  z.string().min(8).max(200),
});
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

router.post('/login',            loginLimiter,  validateBody(loginSchema),   login);
router.post('/refresh',          refreshLimiter, validateBody(refreshSchema), refreshToken);
router.get( '/me',               verifyToken,   me);
router.post('/logout',           verifyToken,   logout);
router.post('/profile/update',   verifyToken,   validatedUpload.single('photo', PHOTO_TYPES), updateProfile);
router.post('/forgot-password',  otpSendLimiter, validateBody(forgotSchema), forgotPassword);
router.post('/reset-password',   otpSendLimiter, validateBody(resetSchema),  resetPassword);

module.exports = router;
