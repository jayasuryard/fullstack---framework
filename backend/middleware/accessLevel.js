/**
 * Read-only access enforcement middleware.
 * Source: Product/backend/middleware/accessLevel.js
 * Generalization: removed hardcoded "management" role name. Products that have a
 * read-only virtual role should add that check after the accessLevel check, or
 * pass `readOnlyRoles` to configure it without touching this file.
 *
 * Place AFTER role() on any mutating route (POST / PUT / PATCH / DELETE).
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
