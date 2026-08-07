// JWT access-token + refresh-token helpers.
// Core payload: id, role, baseRole (for context switching), accessLevel, tokenVersion.
// Add product-specific JWT claims by passing an `extraClaims` object to generateToken().
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

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

// Refresh tokens are OPAQUE random values, NOT JWTs. A JWT refresh token would be
// deterministic (same user + same secret + same TTL → identical token every login),
// which (a) collides on the unique tokenHash column on the second concurrent login
// and (b) gives every session of a user the SAME refresh token — rotation becomes
// meaningless. Expiry lives in the DB row (RefreshToken.expiredAt), not the token.
const generateRefreshToken = () =>
  crypto.randomBytes(48).toString('base64url');

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// NOTE: verifyRefreshToken is intentionally GONE. Refresh tokens are opaque — there
// is nothing to verify cryptographically. Validation = row lookup by tokenHash
// (+ revoked/expired checks) in AuthService.refreshToken.

module.exports = { generateToken, generateRefreshToken, verifyAccessToken };
