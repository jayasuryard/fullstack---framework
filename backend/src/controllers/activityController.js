import * as activityService from '../services/activityService.js';
import { sendPaginated } from '../utils/response.js';

export async function listActivities(req, res, next) {
  try {
    const result = await activityService.listActivities(req.user.id, req.query);
    sendPaginated(res, result.activities, result.pagination);
  } catch (error) {
    next(error);
  }
}
