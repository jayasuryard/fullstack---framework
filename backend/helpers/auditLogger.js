/**
 * Audit logger — writes one row to the AuditLog table.
 * Source: Product/backend/helpers/auditLogger.js (generalized: removed schoolId assumption)
 *
 * @param {string} action   Human-readable label, e.g. "USER_LOGIN", "PASSWORD_RESET"
 * @param {object} user     req.user (must have id, name, role)
 * @param {object} req      Express request (for ip + userAgent)
 * @param {object} extra    Any additional flat key-value pairs for the product to store
 */
const prisma = require('../config/dbConnect');

async function auditLogger(action, user, req, extra = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId:    user.id,
        userName:  user.name,
        userRole:  user.role,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']?.slice(0, 255),
        ...extra,
      },
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to write audit log:', error);
  }
}

module.exports = { auditLogger };
