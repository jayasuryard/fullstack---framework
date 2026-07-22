import * as notificationService from '../services/notificationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export async function listNotifications(req, res, next) {
  try {
    const result = await notificationService.listNotifications(req.user.id, req.query);
    sendPaginated(res, result.notifications, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    if (!notification) return sendSuccess(res, null, 'Notification not found');
    sendSuccess(res, { notification }, 'Marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const deleted = await notificationService.deleteNotification(req.user.id, req.params.id);
    if (!deleted) return sendSuccess(res, null, 'Notification not found');
    sendSuccess(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
}
