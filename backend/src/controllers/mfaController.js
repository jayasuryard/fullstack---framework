import * as mfaService from '../services/mfaService.js';
import { sendSuccess } from '../utils/response.js';

export async function generate(req, res, next) {
  try {
    const result = await mfaService.generateMfaSecret(req.user.id);
    sendSuccess(res, result, 'MFA secret generated');
  } catch (error) {
    next(error);
  }
}

export async function enable(req, res, next) {
  try {
    const { code } = req.body;
    await mfaService.verifyAndEnableMfa(req.user.id, code);
    sendSuccess(res, null, 'MFA enabled');
  } catch (error) {
    next(error);
  }
}

export async function disable(req, res, next) {
  try {
    const { code } = req.body;
    await mfaService.disableMfa(req.user.id, code);
    sendSuccess(res, null, 'MFA disabled');
  } catch (error) {
    next(error);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { purpose } = req.body;
    const result = await mfaService.sendOtp(req.user?.id || req.params.userId, purpose || 'LOGIN');
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { code, purpose } = req.body;
    await mfaService.verifyOtp(req.user.id, code, purpose || 'MFA');
    sendSuccess(res, null, 'OTP verified');
  } catch (error) {
    next(error);
  }
}
