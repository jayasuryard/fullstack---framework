import * as auditLogService from '../services/auditLogService.js';
import { sendPaginated } from '../utils/response.js';

export async function listAuditLogs(req, res, next) {
  try {
    const result = await auditLogService.listAuditLogs(req.query);
    sendPaginated(res, result.logs, result.pagination);
  } catch (error) {
    next(error);
  }
}
