import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getUserDashboard(req.user.id);
    sendSuccess(res, { dashboard: data });
  } catch (error) {
    next(error);
  }
}
