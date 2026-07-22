import * as settingService from '../services/settingService.js';
import { sendSuccess } from '../utils/response.js';

export async function getSettings(req, res, next) {
  try {
    const settings = await settingService.getSettings(req.query.group);
    sendSuccess(res, { settings });
  } catch (error) {
    next(error);
  }
}

export async function getSetting(req, res, next) {
  try {
    const value = await settingService.getSetting(req.params.key);
    if (value === null) return sendSuccess(res, { value: null });
    sendSuccess(res, { value });
  } catch (error) {
    next(error);
  }
}

export async function updateSetting(req, res, next) {
  try {
    const { value, group } = req.body;
    const setting = await settingService.updateSetting(req.params.key, value, group);
    sendSuccess(res, { setting }, 'Setting updated');
  } catch (error) {
    next(error);
  }
}
