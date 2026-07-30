/**
 * Read-only access enforcement middleware.
 * Place AFTER role() on any mutating route (POST / PUT / PATCH / DELETE).
 * Pass `readOnlyRoles` to block additional role names that are always read-only
 * (e.g. ['management', 'viewer'] for your product).
 */
const apiResponse = require('../helpers/apiResponse');

/**
 * @param {string[]} [readOnlyRoles]  Additional role names that are always read-only
 *                                    (e.g. ['management'] in your product). Optional.
 */
module.exports = function requireReadWrite(readOnlyRoles = []) {
  return (req, res, next) => {
    if (readOnlyRoles.includes(req.user.role)) {
      return res.json(apiResponse.response('FORBIDDEN', {
        message: 'This account has read-only access.',
      }));
    }

    if (req.user.accessLevel === 'read_only') {
      return res.json(apiResponse.response('FORBIDDEN', {
        message: 'Your account has read-only access. Contact your administrator.',
      }));
    }

    next();
  };
};
