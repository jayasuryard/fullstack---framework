import * as notificationPrefService from '../services/notificationPrefService.js';
import { sendSuccess } from '../utils/response.js';

export async function getPreferences(req, res, next) {
  try {
    const preferences = await notificationPrefService.getPreferences(req.user.id);
    sendSuccess(res, { preferences });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const preferences = await notificationPrefService.updatePreferences(req.user.id, req.body.preferences);
    sendSuccess(res, { preferences }, 'Preferences updated');
  } catch (error) {
    next(error);
  }
}
