import * as userService from '../services/userService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.id, req.validated.body);
    sendSuccess(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validated.body;
    await userService.updatePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Password updated');
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const result = await userService.listUsers(req.query);
    sendPaginated(res, result.users, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await userService.getUser(req.params.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, { user }, 'User updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, null, 'User deleted');
  } catch (error) {
    next(error);
  }
}
