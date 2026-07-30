/**
 * Auth routes.
 * Source: Product/backend/modules/auth/routes/authRoutes.js (generalized)
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
const { loginLimiter, otpSendLimiter } = require('../../../middleware/rateLimit.js');
const upload      = require('../../../middleware/upload.js');
const {
  login,
  refreshToken,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../services/AuthService');

router.post('/login',           loginLimiter,  login);
router.post('/refresh',                        refreshToken);
router.get( '/me',             verifyToken,   me);
router.post('/logout',         verifyToken,   logout);
router.post('/profile/update', verifyToken,   upload.single('photo'), updateProfile);
router.post('/forgot-password', otpSendLimiter, forgotPassword);
router.post('/reset-password',  otpSendLimiter, resetPassword);

module.exports = router;
