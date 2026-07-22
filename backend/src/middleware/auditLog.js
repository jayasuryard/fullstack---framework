import prisma from '../config/database.js';

export function logAudit(action, entity) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId: req.params.id || body?.data?.id,
            metadata: { method: req.method, path: req.originalUrl, body: req.body },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}
