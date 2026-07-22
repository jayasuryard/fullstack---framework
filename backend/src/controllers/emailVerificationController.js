import * as emailVerificationService from '../services/emailVerificationService.js';
import { sendSuccess } from '../utils/response.js';

export async function sendVerification(req, res, next) {
  try {
    await emailVerificationService.sendVerificationEmail(req.user.id);
    sendSuccess(res, null, 'Verification email sent');
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    await emailVerificationService.verifyEmail(token);
    sendSuccess(res, null, 'Email verified');
  } catch (error) {
    next(error);
  }
}
