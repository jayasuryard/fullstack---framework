import * as adminService from '../services/adminService.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, { stats });
  } catch (error) {
    next(error);
  }
}

export async function getUserAnalytics(req, res, next) {
  try {
    const analytics = await adminService.getUserAnalytics();
    sendSuccess(res, { analytics });
  } catch (error) {
    next(error);
  }
}
