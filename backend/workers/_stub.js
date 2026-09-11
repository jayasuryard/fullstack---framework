/**
 * Background job handler stub — copy this file to add a new job type.
 * Naming convention:  <domain><Action>JobHandler.js   e.g. invoiceNotifyJobHandler.js
 *
 * Register the handler in worker.js:
 *   const { handle<Feature> } = require('./workers/<domain><Action>JobHandler');
 *   handlers['<queue-name>'] = handle<Feature>;
 *
 * Enqueue from any service:
 *   const { enqueueJob } = require('../helpers/queue/jobQueue');
 *   const { jobId } = await enqueueJob('<queue-name>', { ...payload });
 *
 * Idempotency (opt-in): the queue is at-least-once, not exactly-once — a crash
 * mid-handler can cause a legitimate requeue-and-retry, and a recovery sweep can
 * requeue a job whose handler actually finished its side effect right as the
 * lease expired. Pass a stable `idempotencyKey` for jobs with a non-idempotent
 * side effect (charging a card, sending an email, etc.):
 *   await enqueueJob('<queue-name>', { ...payload }, {}, { idempotencyKey: `invoice:${invoiceId}` });
 * and have the handler check/record it before doing the side effect, e.g.:
 *   const already = await prisma.processedJob.findUnique({ where: { idempotencyKey } });
 *   if (already) return already.result;
 * Existing handlers are unaffected if they never enqueue with an idempotencyKey.
 */

/**
 * @param {object} payload        The object passed to enqueueJob()
 * @param {object} ctx
 * @param {string} ctx.jobId
 * @param {string|null} ctx.idempotencyKey  The key passed to enqueueJob's opts, if any
 * @param {Function} ctx.reportProgress  (percent: 0-100, message: string, extra?: object) => void
 * @returns {object}              Result stored in Redis; forwarded to browser on completion.
 */
async function handle<Feature>(payload, { jobId, idempotencyKey, reportProgress }) {
  await reportProgress(0, 'Starting…');

  // ── business logic here ──────────────────────────────────────────────────────
  // Example multi-step pattern from product:
  //   await reportProgress(10, 'Fetching records…');
  //   const records = await prisma.model.findMany({ where: payload.where });
  //   for (let i = 0; i < records.length; i++) {
  //     await processRecord(records[i]);
  //     await reportProgress(Math.round(((i + 1) / records.length) * 90), `Processed ${i + 1}/${records.length}`);
  //   }

  await reportProgress(100, 'Complete.');
  return { success: true };
}

module.exports = { handle<Feature> };
