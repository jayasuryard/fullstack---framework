/**
 * Organization role enforcement. Runs AFTER tenantContext (which sets
 * req.membership). Mirrors middleware/role.js, but reads the per-organization
 * role off the membership row instead of the global User.role.
 *
 *   router.post('/:orgId/invitations',
 *     tenantContext, requireOrgRole(...ORG_PERMISSIONS['members:invite']), invite);
 *
 * ── PERMISSION MATRIX ────────────────────────────────────────────────────────
 * A plain table, deliberately not a policy engine.
 *
 *   capability            owner  admin  member  viewer
 *   org:access              y      y      y       y     (any active member)
 *   members:view            y      y      y       y
 *   org:settings:view       y      y      -       -     (settings + audit log)
 *   members:invite          y      y      -       -
 *   members:manage          y      y      -       -     (role change / removal)
 *   org:delete              y      -      -       -
 *
 * Three guards depend on the TARGET row, not just the caller's role, so they are
 * enforced in OrganizationService.updateMember (a middleware cannot see them):
 *   - nobody may change or remove their OWN membership;
 *   - only an owner may grant the `owner` role (an admin cannot promote anyone,
 *     themselves included, to owner);
 *   - only an owner may demote or remove an existing owner.
 */
const apiResponse = require('../helpers/apiResponse');

const ORG_PERMISSIONS = {
  'org:access':        ['owner', 'admin', 'member', 'viewer'],
  'members:view':      ['owner', 'admin', 'member', 'viewer'],
  'org:settings:view': ['owner', 'admin'],
  'members:invite':    ['owner', 'admin'],
  'members:manage':    ['owner', 'admin'],
  'org:delete':        ['owner'],
};

function requireOrgRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.membership.role)) {
      return apiResponse.send(res, 'FORBIDDEN', {
        message: 'Your role in this organization does not permit that action.',
      });
    }
    return next();
  };
}

module.exports = { requireOrgRole, ORG_PERMISSIONS };
