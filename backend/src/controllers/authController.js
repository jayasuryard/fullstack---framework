import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const result = await authService.login(email, password, ipAddress, userAgent);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.validated.body);
    sendSuccess(res, result, 'Account created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.validated.body;
    const result = await authService.refreshToken(token);
    sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken;
    await authService.logout(req.user.id, refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.validated.body;
    await authService.resetPassword(token, password);
    sendSuccess(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}
