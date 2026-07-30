/**
 * jobWsServer.js
 *
 * WebSocket server that bridges Redis pub/sub → browser for live job progress.
 *
 * Flow:
 *   1. Client opens  ws://.../ws/jobs/:jobId?token=<jwt>
 *   2. JWT is verified (browsers can't set WS headers, so token travels as ?token=)
 *   3. Job ownership is checked: job.meta.userId must match decoded.id
 *      (skip/customize this check if your product uses a different ownership model)
 *   4. Redis channel  job:progress:<jobId>  is subscribed
 *   5. Every PUBLISH from the worker is forwarded to the socket
 *   6. Terminal events (done / failed) close the socket cleanly
 *
 * Multiple PM2 instances work fine — each subscribes to Redis independently.
 * No sticky sessions needed.
 *
 * Mount in server.js:
 *   const server = http.createServer(app);
 *   attachJobWsServer(server);
 *   server.listen(PORT);
 */

const { WebSocketServer } = require("ws");
const { createClient }    = require("redis");
const jwt                 = require("jsonwebtoken");
const { getJobStatus, PROGRESS_CHANNEL_PREFIX } = require("./jobQueue");

const WS_PATH          = "/ws/jobs";
const HEARTBEAT_INTERVAL = 20_000;       // ping every 20 s to keep LB connections alive
const MAX_LIFETIME_MS    = 60 * 60_000;  // hard cut-off: 1 hour

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeSend(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function makeSubscriberClient() {
  const sub = createClient({
    url:      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  });
  sub.on("error", (err) => console.error("[WS-Sub] Redis error:", err.message));
  return sub;
}

function extractToken(req) {
  try {
    const url = new URL(req.url, "ws://localhost");
    return url.searchParams.get("token") || null;
  } catch {
    return null;
  }
}

function extractJobId(req) {
  const pathname = req.url.split("?")[0];
  const parts    = pathname.split("/");
  return parts[parts.length - 1] || null;
}

// ── Main attach function ──────────────────────────────────────────────────────

function attachJobWsServer(httpServer) {
  // noServer: true lets us match by path PREFIX (/ws/jobs/) rather than exact path.
  // Without this, ws rejects "/ws/jobs/<uuid>" with HTTP 400.
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const pathname = req.url.split("?")[0];

    if (!pathname.startsWith(WS_PATH + "/")) return;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", async (ws, req) => {

    // ── 1. Authenticate ───────────────────────────────────────────────────────
    const token = extractToken(req);
    if (!token) {
      safeSend(ws, { type: "error", code: 4001, message: "Missing auth token." });
      ws.close(4001, "Unauthorized");
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      safeSend(ws, { type: "error", code: 4001, message: "Invalid or expired token." });
      ws.close(4001, "Unauthorized");
      return;
    }

    // ── 2. Resolve jobId ──────────────────────────────────────────────────────
    const jobId = extractJobId(req);
    if (!jobId) {
      safeSend(ws, { type: "error", code: 4002, message: "Missing jobId in URL." });
      ws.close(4002, "Bad request");
      return;
    }

    // ── 3. Load job and check ownership ──────────────────────────────────────
    let job;
    try {
      job = await getJobStatus(jobId);
    } catch (err) {
      safeSend(ws, { type: "error", code: 5000, message: "Could not load job status." });
      ws.close(5000, "Server error");
      return;
    }

    if (!job) {
      safeSend(ws, { type: "error", code: 4004, message: "Job not found or expired." });
      ws.close(4004, "Not found");
      return;
    }

    // Ownership check: job was created with meta.userId set to the enqueuing user's ID.
    // Customize this if your product uses a different ownership model (e.g. tenantId).
    if (job.meta?.userId && job.meta.userId !== decoded.id) {
      safeSend(ws, { type: "error", code: 4003, message: "Access denied." });
      ws.close(4003, "Forbidden");
      return;
    }

    // ── 4. Send current snapshot ──────────────────────────────────────────────
    safeSend(ws, {
      type:            "connected",
      jobId,
      status:          job.status,
      progress:        job.progress,
      progressMessage: job.progressMessage,
    });

    if (job.status === "done" || job.status === "failed") {
      safeSend(ws, {
        type:        job.status === "done" ? "complete" : "error",
        jobId,
        status:      job.status,
        progress:    job.status === "done" ? 100 : job.progress,
        result:      job.result,
        error:       job.error,
        completedAt: job.completedAt,
      });
      ws.close(1000, "Job already finished");
      return;
    }

    // ── 5. Subscribe to Redis pub/sub ─────────────────────────────────────────
    const subscriber = makeSubscriberClient();
    let closed       = false;

    function cleanup() {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      clearTimeout(lifetime);
      subscriber
        .unsubscribe()
        .then(() => subscriber.quit())
        .catch(() => subscriber.disconnect());
    }

    try {
      await subscriber.connect();
    } catch (err) {
      console.error(`[WS] Subscriber connect failed for job ${jobId}:`, err.message);
      safeSend(ws, {
        type:    "error",
        code:    5000,
        message: "Real-time unavailable. Poll GET /jobs/:jobId instead.",
      });
      ws.close(5000, "Server error");
      return;
    }

    await subscriber.subscribe(`${PROGRESS_CHANNEL_PREFIX}${jobId}`, (message) => {
      if (closed) return;

      let data;
      try { data = JSON.parse(message); } catch { return; }

      if (data.status === "done") {
        safeSend(ws, {
          type:        "complete",
          jobId,
          status:      "done",
          progress:    100,
          result:      data.result,
          completedAt: data.completedAt,
        });
        cleanup();
        ws.close(1000, "Job complete");
        return;
      }

      if (data.status === "failed") {
        safeSend(ws, {
          type:   "error",
          jobId,
          status: "failed",
          error:  data.error || "Job failed.",
        });
        cleanup();
        ws.close(1000, "Job failed");
        return;
      }

      const { jobId: _jid, status, progress, progressMessage, ...extra } = data;
      safeSend(ws, {
        type: "progress",
        jobId,
        status,
        progress,
        progressMessage: progressMessage || null,
        ...extra,
      });
    });

    // ── 6. Heartbeat ──────────────────────────────────────────────────────────
    const heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.ping();
    }, HEARTBEAT_INTERVAL);

    // ── 7. Hard lifetime cap ──────────────────────────────────────────────────
    const lifetime = setTimeout(() => {
      if (closed) return;
      safeSend(ws, {
        type:    "error",
        code:    4008,
        message: "Stream timed out. Poll GET /jobs/:jobId.",
      });
      cleanup();
      ws.close(4008, "Timeout");
    }, MAX_LIFETIME_MS);

    ws.on("close", () => {
      console.log(`[WS] Client disconnected — job ${jobId} user ${decoded.id}`);
      cleanup();
    });

    ws.on("error", (err) => {
      console.error(`[WS] Socket error — job ${jobId}:`, err.message);
      cleanup();
    });

    ws.on("message", () => {}); // one-way stream
  });

  console.log(`[WS] Job WebSocket server ready at ${WS_PATH}/:jobId`);
  return wss;
}

module.exports = { attachJobWsServer };
