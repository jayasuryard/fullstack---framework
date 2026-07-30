/**
 * JWT access-token + refresh-token helpers.
 * Source: Product/backend/helpers/generateToken.js (generalized: product-specific fields
 * like schoolId/staffId/studentId removed from the base payload — add them in AuthService
 * for your product by passing `extraClaims` to generateToken).
 *
 * Core payload: id, role, baseRole (for context switching), accessLevel, tokenVersion.
 * Add product-specific claims via the `extraClaims` parameter.
 */
const jwt = require('jsonwebtoken');

/**
 * @param {object} user         DB user row (must have id, role, accessLevel, tokenVersion)
 * @param {object} [context]    Present when issuing a context-switched token
 *                              { role, accessLevel, contextId }
 * @param {object} [extraClaims] Additional JWT claims specific to your product
 */
const generateToken = (user, context = null, extraClaims = {}) => {
  return jwt.sign(
    {
      id:           user.id,
      role:         context?.role || user.role,
      baseRole:     user.role,
      accessLevel:  context ? (context.accessLevel || 'read_write') : user.accessLevel,
      tokenVersion: user.tokenVersion,
      contextId:    context?.contextId || null,
      ...extraClaims,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: context
        ? (process.env.JWT_CONTEXT_EXPIRES_IN || '30m')
        : (process.env.JWT_EXPIRES_IN || '24h'),
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRY }
  );
};

const verifyAccessToken  = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_SECRET);

module.exports = { generateToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
