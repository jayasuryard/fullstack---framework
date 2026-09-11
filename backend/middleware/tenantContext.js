/**
 * Tenant (organization) context resolution. Runs AFTER verifyToken.
 *
 * CONVENTION — how the active organization is resolved, in this order:
 *   1. `:orgId` route param, for routes nested under /api/v1/orgs/:orgId/...
 *   2. `X-Organization-Id` header, for tenant-scoped routes that are NOT nested
 *      (future /api/v1/files, /api/v1/notifications, ...).
 * Both may be present — the frontend always sends the header — but they MUST
 * agree; a mismatch is a client bug (stale tab, wrong switcher state) and is
 * rejected 400 rather than silently picking one.
 *
 * There is no server-side "current organization". A user with several orgs runs
 * different orgs in different tabs; making this sticky would cross-contaminate.
 *
 * FAILURE MODE — always 403, never 404. A non-member must not be able to tell a
 * real organization id from a fabricated one, so "org does not exist", "you are
 * not a member", "your membership is invited/removed" and "the org is suspended"
 * all return the identical FORBIDDEN envelope. Same anti-enumeration stance as
 * AuthService.forgotPassword.
 *
 * On success: req.organizationId, req.membership (full row incl. role),
 * req.organization.
 */
const apiResponse = require('../helpers/apiResponse');
const prisma      = require('../config/dbConnect');

const ORG_HEADER = 'x-organization-id';

const DENIED = { message: 'You do not have access to this organization.' };

async function tenantContext(req, res, next) {
  const fromParam  = req.params.orgId;
  const fromHeader = req.headers[ORG_HEADER];

  if (fromParam && fromHeader && fromParam !== fromHeader) {
    return apiResponse.send(res, 'INVALID_REQUEST', {
      message: 'X-Organization-Id does not match the organization in the URL.',
    });
  }

  const organizationId = fromParam || fromHeader;
  if (!organizationId) {
    return apiResponse.send(res, 'INVALID_REQUEST', {
      message: 'Organization context is required (X-Organization-Id header).',
    });
  }

  const membership = await prisma.membership.findUnique({
    where:   { userId_organizationId: { userId: req.user.id, organizationId } },
    include: { organization: true },
  });

  if (!membership || membership.status !== 'active') {
    return apiResponse.send(res, 'FORBIDDEN', DENIED);
  }
  if (membership.organization.status !== 'active') {
    return apiResponse.send(res, 'FORBIDDEN', DENIED);
  }

  req.organizationId = organizationId;
  req.membership     = membership;
  req.organization   = membership.organization;
  return next();
}

module.exports = tenantContext;
module.exports.ORG_HEADER = ORG_HEADER;
