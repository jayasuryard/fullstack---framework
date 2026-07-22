import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/database.js';

export function can(action, resource) {
  return async (req, res, next) => {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const role = req.user.role;

      const permission = await prisma.permission.findUnique({
        where: { action_resource: { action, resource } },
        include: {
          roles: {
            where: { role: { name: role } },
          },
        },
      });

      if (!permission || permission.roles.length === 0) {
        const staticPermissions = {
          SUPER_ADMIN: '*',
          ADMIN: ['read', 'manage'],
          MANAGER: ['read', 'create', 'update'],
          MEMBER: ['read'],
          VIEWER: ['read'],
        };

        const allowed = staticPermissions[role];
        if (allowed === '*' || (Array.isArray(allowed) && allowed.includes(action))) {
          return next();
        }
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error.isOperational) return next(error);
      next(ApiError.forbidden('Insufficient permissions'));
    }
  };
}
