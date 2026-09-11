/**
 * Central route aggregator.
 * Convention: /api/v1/<actor>/<resource>
 * Mount each module's router here after verifyToken + role() guards.
 *
 * Example:
 *   const userRoutes = require('../modules/user/routes/userRoutes');
 *   router.use('/admin/users', verifyToken, role('admin'), userRoutes);
 */
const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/verifyToken');

// ── Auth (public endpoints — no verifyToken) ───────────────────────────────────
const authRoutes = require('../modules/auth/routes/authRoutes');
router.use('/common/auth', authRoutes);

// ── Organizations / multi-tenancy (authenticated; tenant guard is per-route) ──
const organizationRoutes = require('../modules/organizations/routes/organizationRoutes');
router.use('/orgs', verifyToken, organizationRoutes);

// ── Add your product's modules below ──────────────────────────────────────────
// const exampleRoutes = require('../modules/example/routes/exampleRoutes');
// router.use('/admin/example', verifyToken, role('admin'), exampleRoutes);

module.exports = router;
