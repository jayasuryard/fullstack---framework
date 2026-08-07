/**
 * JWT authentication middleware.
 *
 * Checks (in order):
 *  1. Authorization: Bearer <token> header present
 *  2. JWT signature valid + not expired
 *  3. User exists in DB, not soft-deleted, not deactivated
 *  4. tokenVersion matches (catches forced logouts / password resets)
 *
 * Populates req.user with the full DB row plus effective role/accessLevel
 * from the token (supports context-switched tokens where role !== baseRole).
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

    req.user = {
      ...user,
      exp:             decoded.exp,
      baseRole:        decoded.baseRole || user.role,
      baseAccessLevel: user.accessLevel,
      role:            decoded.role || user.role,
      accessLevel:     decoded.accessLevel ?? user.accessLevel,
      contextId:       decoded.contextId || null,
    };

    next();
  } catch (error) {
    console.error('[verifyToken]', error);
    return apiResponse.send(res, 'SERVER_ERROR');
  }
};

module.exports = verifyToken;
