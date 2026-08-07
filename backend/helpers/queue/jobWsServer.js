/**
 * jobWsServer.js
 *
 * Job-progress WebSocket endpoint — thin, job-specific configuration on top of
 * the shared hub (helpers/ws/hub.js). The hub owns the socket lifecycle, auth,
 * Redis relay, heartbeat, and channel fan-out; this file only maps the
 * /ws/jobs/:jobId path to the job:<jobId> channel and enforces ownership
 * (job.meta.userId must match the JWT subject).
 *
 * Flow:
 *   1. Client opens  ws://.../ws/jobs/:jobId?token=<jwt>
 *   2. Hub verifies the JWT (browsers can't set WS headers, so token travels as ?token=)
 *   3. This shim checks ownership via authorizeChannel
 *   4. Hub subscribes the client to channel  job:<jobId>  (Redis pub/sub relay)
 *   5. Every emitToChannel('job:<jobId>', ...) from the worker reaches the browser
 *   6. Snapshot (current status/progress) is sent as the first event
 *
 * Multiple PM2 instances work fine — each subscribes to Redis independently.
 * No sticky sessions needed.
 *
 * Mount in server.js:
 *   const server = http.createServer(app);
 *   attachJobWsServer(server);
 *   server.listen(PORT);
 */

const { attachWsHub } = require('../ws/hub');
const { getJobStatus } = require('./jobQueue');

function extractJobId(req) {
  const pathname = req.url.split('?')[0];
  const parts    = pathname.split('/');
  return parts[parts.length - 1] || null;
}

function attachJobWsServer(httpServer) {
  return attachWsHub(httpServer, {
    pathPrefix: '/ws/jobs/',
    channelFromRequest: (req) => `job:${extractJobId(req)}`,

    // Ownership: job must have been created with meta.userId set to the
    // enqueuing user's ID — jobs without an owner are not exposed over WS.
    // Customize if your product uses a different ownership model (e.g. tenantId).
    authorizeChannel: async (channel, decoded) => {
      const jobId = channel.slice(4);
      if (!jobId) return false;
      const job = await getJobStatus(jobId).catch(() => null);
      return !!(job && job.meta?.userId && job.meta.userId === decoded.id);
    },

    // First event on the channel = current job snapshot (poll-equivalent).
    snapshotFor: async (channel) => {
      const jobId = channel.slice(4);
      const job   = await getJobStatus(jobId);
      if (!job) return null;
      return {
        channel:        'job:' + jobId,
        status:         job.status,
        progress:       job.progress,
        progressMessage: job.progressMessage,
        result:         job.result,
        error:          job.error,
        completedAt:    job.completedAt,
      };
    },
  });
}

module.exports = { attachJobWsServer };
