/**
 * Role-based access control middleware.
 * Source: Product/backend/middleware/role.js (direct extraction)
 *
 * Usage: router.get('/admin-only', verifyToken, role('admin', 'superAdmin'), handler)
 */
const apiResponse = require('../helpers/apiResponse');

module.exports = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.json(apiResponse.response('FORBIDDEN'));
    }
    next();
  };
};
