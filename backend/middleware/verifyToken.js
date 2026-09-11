/**
 * JWT authentication middleware.
 *
 * Checks (in order):
 *  1. Authorization: Bearer <token> header present
 *  2. JWT signature valid + not expired
 *  3. User exists in DB, not soft-deleted, not deactivated
 *  4. tokenVersion matches (catches forced logouts / password resets)
 *
 * Populates req.user with the full DB row. Effective role/accessLevel come from
 * the CURRENT DB row, not the JWT payload — this codebase has no tokenVersion-bump
 * on role change yet, so an admin->member downgrade must take effect on the very
 * next request, not wait for the 24h JWT to expire (F12). The one exception is a
 * context-switched token (decoded.contextId set, e.g. impersonation): those are
 * short-lived (JWT_CONTEXT_EXPIRES_IN, 30m) and INTENTIONALLY carry a role/accessLevel
 * that differs from the user's base row, so the token's own claims win for those.
 * To add product-specific per-request grant validation, add it after the tokenVersion check.
 */
const jwt        = require('jsonwebtoken');
const apiResponse = require('../helpers/apiResponse.js');
const prisma     = require('../config/dbConnect.js');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.send(res, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return apiResponse.send(res, 'TOKEN_EXPIRED');
      }
      return apiResponse.send(res, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.isDeleted || !user.active) {
      return apiResponse.send(res, 'UNAUTHORIZED');
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return apiResponse.send(res, 'UNAUTHORIZED', {
        message: 'Token has been invalidated. Please log in again.',
      });
    }

    const isContextSwitched = !!decoded.contextId;

    req.user = {
      ...user,
      exp:             decoded.exp,
      baseRole:        user.role,
      baseAccessLevel: user.accessLevel,
      // Context-switched tokens keep the claims they were issued with; everything
      // else reflects the user's CURRENT row so a role/accessLevel change applies
      // on the very next request instead of waiting for the JWT to expire.
      role:            isContextSwitched ? (decoded.role || user.role) : user.role,
      accessLevel:     isContextSwitched ? (decoded.accessLevel ?? user.accessLevel) : user.accessLevel,
      contextId:       decoded.contextId || null,
    };

    next();
  } catch (error) {
    console.error('[verifyToken]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
};

module.exports = verifyToken;
