// hub.js — reusable WebSocket emitter/receiver for the whole framework.
//
// One hub owns all WebSocket traffic on the HTTP server. Any backend service can
// push to browsers (or other clients) with emitToChannel(channel, payload), and
// any client can subscribe to any channel. Works across PM2 cluster via Redis
// pub/sub relay — every API instance subscribes independently, no sticky sessions.
//
//   Server side:
//     const { attachWsHub, emitToChannel } = require('./helpers/ws/hub');
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
//     authorizeChannel     async (channel, decoded, req) => boolean — per-channel access
//     snapshotFor          async (channel, decoded) => payload — sent as first event
//     maxLifetimeMs        hard per-connection cap (default 1 hour)
//
// Security: token travels as ?token= because browsers cannot set WS headers.

const { WebSocketServer } = require('ws');
const { createClient }    = require('redis');
const jwt                 = require('jsonwebtoken');

const RELAY_PREFIX      = 'ws:channel:';
const HEARTBEAT_INTERVAL = 20_000;       // ping every 20 s to keep LB connections alive
const MAX_LIFETIME_MS    = 60 * 60_000;  // hard cut-off: 1 hour

let relayStarted = false;

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

/**
 * Publish an event to a channel. Any process (API or worker) can call this —
 * the Redis relay fans it out to every connected, subscribed client.
 */
async function emitToChannel(channel, payload) {
  const { client } = require('../../config/redisConfig');
  await client.publish(`${RELAY_PREFIX}${channel}`, JSON.stringify(payload));
}

/**
 * Attach the shared WebSocket hub to an http.Server.
 * Returns the internal WebSocketServer (for tests / advanced use).
 */
function attachWsHub(httpServer, options = {}) {
  const {
    pathPrefix         = '/ws',
    channelFromRequest = null,
    authorizeChannel   = null,
    snapshotFor        = null,
    maxLifetimeMs      = MAX_LIFETIME_MS,
  } = options;

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = (req.url || '').split('?')[0];
    const isJobsPath = pathname.startsWith('/ws/jobs/');
    const isGeneric  = pathname === '/ws' || pathname.startsWith('/ws?');

    if (pathPrefix === '/ws/jobs/') {
      if (!isJobsPath) return;   // job shim only claims /ws/jobs/*
    } else {
      if (!isGeneric || isJobsPath) return;  // generic hub never claims job paths
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  // ── Cluster-wide relay: one pattern-subscriber per process ──────────────────
  const startRelay = () => {
    if (relayStarted) return;
    relayStarted = true;

    const sub = createClient({
      url:      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD || undefined,
      database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
    });
    sub.on('error', (err) => console.error('[WS-Hub] Relay Redis error:', err.message));

    sub.connect()
      .then(() => sub.pSubscribe(`${RELAY_PREFIX}*`, (message, subscribedChannel) => {
        const channel = subscribedChannel.slice(RELAY_PREFIX.length);

        let payload;
        try { payload = JSON.parse(message); } catch { return; }

        const envelope = { type: 'event', channel, payload };
        wss.clients.forEach((ws) => {
          if (ws.readyState === ws.OPEN && ws.subscribedChannels?.has(channel)) {
            safeSend(ws, envelope);
          }
        });
      }))
      .catch((err) => {
        console.error('[WS-Hub] Relay subscribe failed:', err.message);
        relayStarted = false;  // allow retry on next attach
      });
  };
  startRelay();

  // ── Connection lifecycle ─────────────────────────────────────────────────────
  wss.on('connection', async (ws, req) => {
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

    // Initial channels: from ?channels= and/or derived from the URL path.
    const initialChannels = new Set(extractQueryChannels(req));
    if (channelFromRequest) {
      const derived = channelFromRequest(req);
      (Array.isArray(derived) ? derived : [derived]).filter(Boolean).forEach(c => initialChannels.add(c));
    }

    // Authorization gate runs once per channel at subscribe time.
    const canAccess = async (channel) => {
      if (!authorizeChannel) return true;
      try { return await authorizeChannel(channel, decoded, req); }
      catch { return false; }
    };

    const subscribeChannels = async (channels) => {
      const added = [];
      for (const channel of channels) {
        if (ws.subscribedChannels.has(channel)) continue;
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

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg?.type === 'subscribe' && Array.isArray(msg.channels)) {
        subscribeChannels(msg.channels).then(ok => {
          if (ok.length) safeSend(ws, { type: 'subscribed', channels: ok });
        });
      }

      if (msg?.type === 'unsubscribe' && Array.isArray(msg.channels)) {
        msg.channels.forEach(ch => ws.subscribedChannels.delete(ch));
      }
    });

    // ── Heartbeat + lifetime cap ───────────────────────────────────────────────
    const heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.ping();
    }, HEARTBEAT_INTERVAL);

    const lifetime = setTimeout(() => {
      safeSend(ws, { type: 'error', code: 4008, message: 'Stream timed out. Reconnect to keep listening.' });
      ws.close(4008, 'Timeout');
    }, maxLifetimeMs);

    const cleanup = () => {
      clearInterval(heartbeat);
      clearTimeout(lifetime);
    };

    ws.on('close', () => { cleanup(); });
    ws.on('error', (err) => { console.error('[WS-Hub] Socket error:', err.message); cleanup(); });
  });

  console.log(`[WS-Hub] WebSocket hub ready on ${pathPrefix}`);
  return wss;
}

module.exports = { attachWsHub, emitToChannel };
