// hub.js — reusable WebSocket emitter/receiver for the whole framework.
//
// One hub owns all WebSocket traffic on the HTTP server. Any backend service can
// push to browsers (or other clients) with emitToChannel(channel, payload), and
// any client can subscribe to any channel it is authorized for. Works across PM2
// cluster via Redis pub/sub relay — every API instance subscribes independently,
// no sticky sessions.
//
//   Server side:
//     const { attachWsHub } = require('./helpers/ws/hub');
//     attachWsHub(server);                                  // generic /ws endpoint
//     emitToChannel('user:' + userId, { event: 'plan-changed' });
//
//   Client side (frontend/src/server/ws.js):
//     wsClient.connect(['user:' + userId]);
//     wsClient.onChannel('user:' + userId, (payload) => ...);
//
//   Wire protocol (server → client):
//     { type: 'connected', channels: [...] }                       on open
//     { type: 'event',     channel, payload }                      channel message
//     { type: 'error',     code, message }                         auth/subscribe failure
//
//   Client → server (optional, channels can also be passed as ?channels= on connect):
//     { type: 'subscribe', channels: [...] }
//
//   Paths:
//     /ws?token=<jwt>&channels=a,b          generic multi-channel
//     /ws/jobs/:jobId?token=<jwt>           job progress (jobWsServer shim)
//
//   Options:
//     pathPrefix           only claim upgrades whose path starts with this (default /ws)
//     channelFromRequest   (req) => channel|string[]  — derive channel(s) from URL path
//     authorizeChannel     async (channel, decoded, req) => boolean — per-channel access.
//                           If omitted, the hub falls back to defaultAuthorizeChannel
//                           (FAIL-CLOSED — see below), never to blanket allow.
//     snapshotFor          async (channel, decoded) => payload — sent as first event
//     maxLifetimeMs        hard per-connection cap (default 1 hour)
//
// Upgrade routing: multiple hubs (generic + per-job, and any future ones) can be
// attached to the SAME http.Server. Each hub owns a `noServer: true`
// WebSocketServer and registers itself in a per-httpServer registry instead of
// adding its own 'upgrade' listener — only the FIRST attach for a given
// http.Server installs the listener, which then dispatches every upgrade to the
// most specific matching hub (longest pathPrefix wins) and destroys the socket
// only when nothing matches. Registering more than one 'upgrade' listener on the
// same server is the bug this avoids: a hub that already accepted the socket via
// handleUpgrade() would otherwise get it destroyed right after by another
// listener's catch-all.
//
// Authorization: the default (no `authorizeChannel` supplied) is FAIL-CLOSED —
// unknown channel prefixes are denied. The one built-in rule covers the
// `user:<id>` convention used throughout the codebase (emitToChannel('user:' +
// userId, ...)): only the connection whose JWT subject matches <id> may
// subscribe. Extend DEFAULT_CHANNEL_RULES for new prefixes (e.g. `org:<id>`).
//
// Identity is re-validated against the DB (exists, active, not deleted,
// tokenVersion matches) on connect, on every subscribe message, and on a
// periodic timer — not just once at handshake — so a revoked/deactivated user's
// still-unexpired JWT cannot keep a connection or subscription alive.
//
// Security: token travels as ?token= because browsers cannot set WS headers.

const { WebSocketServer } = require('ws');
const { createClient }    = require('redis');
const jwt                 = require('jsonwebtoken');
const prisma               = require('../../config/dbConnect');
const { allowedOrigins }   = require('../../config/corsConfig');

const RELAY_PREFIX       = 'ws:channel:';
const HEARTBEAT_INTERVAL = 20_000;       // ping every 20 s to keep LB connections alive
const MAX_LIFETIME_MS    = 60 * 60_000;  // hard cut-off: 1 hour
const REVALIDATE_INTERVAL_MS = 5 * 60_000; // periodic DB re-check while connected
const MAX_SUBSCRIPTIONS_PER_CONN = 64;
const MAX_MESSAGE_BYTES  = 16 * 1024;    // 16KB — reject oversized incoming frames

// ── Default (fail-closed) channel authorization ───────────────────────────────
// Covers the `user:<id>` convention (see emitToChannel('user:' + userId, ...)
// call sites). Any prefix without a matching rule is DENIED by default — a hub
// must opt in with its own `authorizeChannel`, never opt out silently.
const DEFAULT_CHANNEL_RULES = [
  { prefix: 'user:', check: (rest, decoded) => !!rest && rest === decoded.id },
  // { prefix: 'org:', check: (rest, decoded) => decoded.orgIds?.includes(rest) },
];

function defaultAuthorizeChannel(channel, decoded) {
  for (const rule of DEFAULT_CHANNEL_RULES) {
    if (channel.startsWith(rule.prefix)) {
      return !!rule.check(channel.slice(rule.prefix.length), decoded);
    }
  }
  return false; // fail-closed: no rule for this prefix => deny
}

// ── Per-httpServer upgrade dispatcher registry ─────────────────────────────────
// httpServer -> [{ pathPrefix, wss }]. Exactly one 'upgrade' listener is ever
// installed per http.Server (tracked in serversWithListener); it looks up the
// most specific (longest pathPrefix) matching entry and calls that hub's
// handleUpgrade, destroying the socket only when nothing matches.
const serverRegistries    = new WeakMap();
const serversWithListener = new WeakSet();

function registerHubForServer(httpServer, pathPrefix, wss) {
  let registry = serverRegistries.get(httpServer);
  if (!registry) {
    registry = [];
    serverRegistries.set(httpServer, registry);
  }
  registry.push({ pathPrefix, wss });

  if (!serversWithListener.has(httpServer)) {
    serversWithListener.add(httpServer);
    httpServer.on('upgrade', (req, socket, head) => {
      const pathname = (req.url || '').split('?')[0];
      const candidates = serverRegistries.get(httpServer) || [];

      let best = null;
      for (const entry of candidates) {
        if (pathname.startsWith(entry.pathPrefix)) {
          if (!best || entry.pathPrefix.length > best.pathPrefix.length) best = entry;
        }
      }

      if (!best) {
        socket.destroy();
        return;
      }

      best.wss.handleUpgrade(req, socket, head, (ws) => {
        best.wss.emit('connection', ws, req);
      });
    });
  }
}

function unregisterHubForServer(httpServer, wss) {
  const registry = serverRegistries.get(httpServer);
  if (!registry) return;
  const idx = registry.findIndex(entry => entry.wss === wss);
  if (idx !== -1) registry.splice(idx, 1);
}

// ── Cluster-wide relay: fan out to every hub instance in this process ─────────
// A single Redis pattern-subscriber per process dispatches to ALL registered
// hub WebSocketServers (not just the first one attached) — otherwise a second
// hub's clients (e.g. the job hub) never receive messages published via
// emitToChannel.
let relayStarted = false;
let relaySubClient = null;
const activeHubs = new Set(); // Set<WebSocketServer>

function safeSend(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function extractToken(req) {
  try {
    const url = new URL(req.url, 'ws://localhost');
    return url.searchParams.get('token') || null;
  } catch {
    return null;
  }
}

function extractQueryChannels(req) {
  try {
    const url   = new URL(req.url, 'ws://localhost');
    const param = url.searchParams.get('channels');
    if (!param) return [];
    return param.split(',').map(s => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function isOriginAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients (workers, curl) send no Origin header
  return allowedOrigins.includes(origin);
}

/**
 * Publish an event to a channel. Any process (API or worker) can call this —
 * the Redis relay fans it out to every connected, subscribed client across
 * every hub instance in every process.
 */
async function emitToChannel(channel, payload) {
  const { client } = require('../../config/redisConfig');
  await client.publish(`${RELAY_PREFIX}${channel}`, JSON.stringify(payload));
}

function startRelay() {
  if (relayStarted) return;
  relayStarted = true;

  const sub = createClient({
    url:      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  });
  relaySubClient = sub;
  sub.on('error', (err) => console.error('[WS-Hub] Relay Redis error:', err.message));

  sub.connect()
    .then(() => sub.pSubscribe(`${RELAY_PREFIX}*`, (message, subscribedChannel) => {
      const channel = subscribedChannel.slice(RELAY_PREFIX.length);

      let payload;
      try { payload = JSON.parse(message); } catch { return; }

      const envelope = { type: 'event', channel, payload };
      for (const wss of activeHubs) {
        wss.clients.forEach((ws) => {
          if (ws.readyState === ws.OPEN && ws.subscribedChannels?.has(channel)) {
            safeSend(ws, envelope);
          }
        });
      }
    }))
    .catch((err) => {
      console.error('[WS-Hub] Relay subscribe failed:', err.message);
      relayStarted = false;  // allow retry on next attach
    });
}

// Validates the JWT subject against the DB: exists, active, not deleted, and
// tokenVersion still current. Returns the fresh user row or null.
async function validateIdentity(decoded) {
  if (!decoded?.id) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.isDeleted || !user.active) return null;
    if (typeof user.tokenVersion === 'number' && decoded.tokenVersion !== user.tokenVersion) return null;
    return user;
  } catch (err) {
    console.error('[WS-Hub] Identity validation failed:', err.message);
    return null;
  }
}

/**
 * Attach the shared WebSocket hub to an http.Server.
 * Returns the internal WebSocketServer (for tests / advanced use).
 */
function attachWsHub(httpServer, options = {}) {
  const {
    pathPrefix         = '/ws',
    channelFromRequest = null,
    authorizeChannel   = defaultAuthorizeChannel,
    snapshotFor        = null,
    maxLifetimeMs      = MAX_LIFETIME_MS,
  } = options;

  const wss = new WebSocketServer({ noServer: true });

  registerHubForServer(httpServer, pathPrefix, wss);
  activeHubs.add(wss);
  httpServer.on('close', () => {
    activeHubs.delete(wss);
    unregisterHubForServer(httpServer, wss);
  });

  startRelay();

  // ── Connection lifecycle ─────────────────────────────────────────────────────
  wss.on('connection', async (ws, req) => {
    if (!isOriginAllowed(req)) {
      ws.close(4003, 'Origin not allowed');
      return;
    }

    ws.subscribedChannels = new Set();

    const token = extractToken(req);
    if (!token) {
      safeSend(ws, { type: 'error', code: 4001, message: 'Missing auth token.' });
      ws.close(4001, 'Unauthorized');
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      safeSend(ws, { type: 'error', code: 4001, message: 'Invalid or expired token.' });
      ws.close(4001, 'Unauthorized');
      return;
    }

    const user = await validateIdentity(decoded);
    if (!user) {
      safeSend(ws, { type: 'error', code: 4001, message: 'Session no longer valid.' });
      ws.close(4001, 'Unauthorized');
      return;
    }

    // Initial channels: from ?channels= and/or derived from the URL path.
    const initialChannels = new Set(extractQueryChannels(req));
    if (channelFromRequest) {
      const derived = channelFromRequest(req);
      (Array.isArray(derived) ? derived : [derived]).filter(Boolean).forEach(c => initialChannels.add(c));
    }

    // Authorization gate runs once per channel at subscribe time. Fail-closed:
    // any thrown/rejected check denies access.
    const canAccess = async (channel) => {
      try { return await authorizeChannel(channel, decoded, req); }
      catch { return false; }
    };

    const subscribeChannels = async (channels) => {
      const added = [];
      for (const channel of channels) {
        if (ws.subscribedChannels.has(channel)) continue;

        if (ws.subscribedChannels.size >= MAX_SUBSCRIPTIONS_PER_CONN) {
          safeSend(ws, { type: 'error', code: 4009, message: 'Subscription limit reached.' });
          break;
        }

        if (!(await canAccess(channel))) {
          safeSend(ws, { type: 'error', code: 4003, message: `Access denied for channel: ${channel}` });
          continue;
        }
        ws.subscribedChannels.add(channel);
        added.push(channel);

        // Send current snapshot (if any) as the first event on the channel.
        if (snapshotFor) {
          try {
            const snapshot = await snapshotFor(channel, decoded);
            if (snapshot !== undefined && snapshot !== null) {
              safeSend(ws, { type: 'event', channel, payload: snapshot });
            }
          } catch (err) {
            console.error(`[WS-Hub] Snapshot failed for ${channel}:`, err.message);
          }
        }
      }
      return added;
    };

    const added = await subscribeChannels([...initialChannels]);
    safeSend(ws, { type: 'connected', channels: added });

    ws.on('message', async (raw) => {
      if (Buffer.byteLength(raw) > MAX_MESSAGE_BYTES) {
        safeSend(ws, { type: 'error', code: 4009, message: 'Message too large.' });
        ws.close(4009, 'Message too large');
        return;
      }

      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg?.type === 'subscribe' && Array.isArray(msg.channels)) {
        // Re-validate identity on every new subscription, not just at connect.
        const stillValid = await validateIdentity(decoded);
        if (!stillValid) {
          safeSend(ws, { type: 'error', code: 4001, message: 'Session no longer valid.' });
          ws.close(4001, 'Unauthorized');
          return;
        }
        const ok = await subscribeChannels(msg.channels);
        if (ok.length) safeSend(ws, { type: 'subscribed', channels: ok });
      }

      if (msg?.type === 'unsubscribe' && Array.isArray(msg.channels)) {
        msg.channels.forEach(ch => ws.subscribedChannels.delete(ch));
      }
    });

    // ── Heartbeat + lifetime cap + periodic identity re-check ─────────────────
    const heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.ping();
    }, HEARTBEAT_INTERVAL);

    const revalidate = setInterval(async () => {
      const stillValid = await validateIdentity(decoded);
      if (!stillValid) {
        safeSend(ws, { type: 'error', code: 4001, message: 'Session revoked.' });
        ws.close(4001, 'Unauthorized');
      }
    }, REVALIDATE_INTERVAL_MS);

    const lifetime = setTimeout(() => {
      safeSend(ws, { type: 'error', code: 4008, message: 'Stream timed out. Reconnect to keep listening.' });
      ws.close(4008, 'Timeout');
    }, maxLifetimeMs);

    const cleanup = () => {
      clearInterval(heartbeat);
      clearInterval(revalidate);
      clearTimeout(lifetime);
    };

    ws.on('close', () => { cleanup(); });
    ws.on('error', (err) => { console.error('[WS-Hub] Socket error:', err.message); cleanup(); });
  });

  console.log(`[WS-Hub] WebSocket hub ready on ${pathPrefix}`);
  return wss;
}

// Test-only: closes the module-level relay Redis subscriber and resets state so
// a `node --test` process can exit cleanly and a subsequent test file gets a
// fresh relay. Never call this from application code.
async function _closeRelayForTests() {
  activeHubs.clear();
  if (relaySubClient) {
    await relaySubClient.quit().catch(() => {});
    relaySubClient = null;
  }
  relayStarted = false;
}

module.exports = { attachWsHub, emitToChannel, defaultAuthorizeChannel, _closeRelayForTests };
