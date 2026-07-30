/**
 * Express application entry point.
 * Source: Product/backend/server.js (generalized: product-specific crons, webhook
 * pre-routes, and product naming removed — add them back in your product).
 */
const express = require('express');
const http    = require('http');
const cors    = require('cors');
require('dotenv').config();

const routes      = require('./routes');
const { client }  = require('./config/redisConfig');

const app    = express();
const server = http.createServer(app);
const port   = process.env.PORT || 3000;

// Serialize BigInt as Number in JSON (storage/counter fields are safe well under MAX_SAFE_INTEGER)
BigInt.prototype.toJSON = function () { return Number(this); };

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
// If your product has a payment webhook that requires the raw body for HMAC verification,
// mount it HERE before express.json() — see Product/backend/server.js for the pattern.

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.locals.redis = client;

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ── WebSocket servers ──────────────────────────────────────────────────────────
// If your product uses real-time WebSocket streams (job progress, live features),
// attach them here using the http.Server instance, not the Express app.
// Pattern: attachJobWsServer(server);  — see Product/backend for the full implementation.

// Fallback: destroy any unclaimed upgrade request
server.on('upgrade', (req, socket) => { if (!socket.destroyed) socket.destroy(); });

// ── Cron jobs ──────────────────────────────────────────────────────────────────
// Import and start your product's cron jobs here.
// Pattern: const { startFeatureCron } = require('./jobs/featureCron'); startFeatureCron();

// ── Start ──────────────────────────────────────────────────────────────────────
server.listen(port, () => console.log(`Server running on port ${port}`));
