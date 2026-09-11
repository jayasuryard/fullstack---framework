/**
 * Tenant scoping for Prisma queries.
 *
 * RULE: every Prisma query against a tenant-owned table (any model carrying
 * organizationId) MUST be filtered by the caller's organization. Use this:
 *
 *   const files = await prisma.file.findMany({ where: scopedWhere(req, { archived: false }) });
 *   const one   = await prisma.file.findFirst({ where: scopedWhere(req, { id }) });
 *
 * Never `findUnique({ where: { id } })` on a tenant-owned row — that bypasses the
 * tenant filter entirely and is how cross-tenant reads happen. Look the row up
 * with findFirst + scopedWhere, or re-check row.organizationId before using it.
 * If a query genuinely must span tenants (a cron sweep, a superAdmin report),
 * say so in a comment at the call site.
 *
 * WHY NOT a Prisma Client Extension that auto-injects the filter: silent
 * auto-scoping hides the tenant boundary from the reader and fails open in the
 * cases it does not cover (raw SQL, nested writes, aggregates, $transaction
 * callbacks). An explicit, greppable call site is auditable in review; a subtle
 * auto-scoping bug is a cross-tenant leak nobody can see. If that tradeoff ever
 * flips, add the extension as a REJECT-only guard (throw when a tenant model is
 * queried without organizationId) rather than a silent injector.
 */

/**
 * @param {import('express').Request} req  must have passed middleware/tenantContext
 * @param {object} [extra]  additional where-clause fields
 */
function scopedWhere(req, extra = {}) {
  if (!req.organizationId) {
    throw new Error('scopedWhere() requires middleware/tenantContext to have run first');
  }
  // organizationId last on purpose: a caller-supplied `extra.organizationId`
  // must never be able to widen or redirect the tenant filter.
  return { ...extra, organizationId: req.organizationId };
}

module.exports = { scopedWhere };
