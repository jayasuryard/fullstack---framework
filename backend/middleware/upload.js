/**
 * File upload middleware (multer, memory storage).
 * Files are buffered in memory (req.file.buffer) so they can be streamed
 * directly to S3 or Cloudinary without writing to disk.
 * Default limit: 5 MB per file, 20 MB total per request.
 *
 * Security: strict allowlist by MIME + extension, PLUS a per-call-site allowlist —
 * every call to validatedUpload.single()/fields() must declare which of the MIME
 * types below it accepts for that field, and the magic-byte / content sniff for
 * the file's CLAIMED mimetype must actually match its bytes. A field scoped to
 * PDF only will reject a byte-perfect PNG even though PNG is a recognized type
 * elsewhere in the app, and a PNG relabeled as image/jpeg is rejected because the
 * jpeg sniffer won't match png bytes. SVG is deliberately never allowlisted
 * (stored-XSS vector via hosted SVG). Rejected files fail with a MulterError →
 * mapped to HTTP 400 by the error handler.
 */
const multer = require('multer');

const ALLOWED = new Map([
  ['image/jpeg',     ['.jpg', '.jpeg']],
  ['image/png',      ['.png']],
  ['image/webp',     ['.webp']],
  ['image/gif',      ['.gif']],
  ['application/pdf', ['.pdf']],
  ['application/msword', ['.doc']],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['.docx']],
  ['application/vnd.ms-excel', ['.xls']],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['.xlsx']],
  ['text/csv',       ['.csv']],
  ['video/mp4',      ['.mp4']],
  ['video/webm',     ['.webm']],
]);

// Per-MIME-type detector: verifies the buffer's actual bytes match that SPECIFIC
// claimed type, not just "is this any recognized signature". .doc/.xls (legacy OLE
// compound files) share one container signature, as do .docx/.xlsx (both are ZIP/
// OOXML) — distinguishing those two pairs further needs parsing the archive/stream
// contents, which is out of scope here; they're still rejected if the bytes aren't
// even a valid OLE/ZIP container.
const OLE_SIG = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const isOle   = (buf) => buf.length >= 8 && OLE_SIG.every((b, i) => buf[i] === b);
const isZip   = (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07);

// CSV has no magic bytes — it's plain text. Heuristic: must be valid UTF-8/ASCII
// (no NUL bytes / control chars outside whitespace, i.e. not a mislabeled binary
// file) and the first non-empty line must look delimited (comma/semicolon/tab).
function looksLikeCsv(buf) {
  if (!buf || buf.length === 0) return false;
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  for (const byte of sample) {
    if (byte === 0x00) return false; // NUL byte → binary, not text
    if (byte < 0x09) return false;   // control chars below tab → binary
  }
  let text;
  try {
    text = sample.toString('utf8');
  } catch {
    return false;
  }
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
  if (!firstLine) return false;
  return /[,;\t]/.test(firstLine);
}

const SNIFFERS = new Map([
  ['image/jpeg', (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff],
  ['image/png',  (buf) => buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47],
  ['image/gif',  (buf) => buf.length >= 4 && buf.toString('ascii', 0, 4) === 'GIF8'],
  ['image/webp', (buf) => buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'],
  ['application/pdf', (buf) => buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-'],
  ['application/msword', isOle],
  ['application/vnd.ms-excel', isOle],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', isZip],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', isZip],
  ['text/csv', looksLikeCsv],
  ['video/mp4', (buf) => buf.length >= 12 && buf.toString('ascii', 4, 8) === 'ftyp'],
  ['video/webm', (buf) => buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3],
]);

function sniffMatchesClaimedType(mimetype, buffer) {
  const matcher = SNIFFERS.get(mimetype);
  if (!matcher) return false; // no sniffer registered → refuse rather than trust blindly
  return matcher(buffer || Buffer.alloc(0));
}

const MAX_FILE_SIZE  = 5 * 1024 * 1024;  // per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // whole multipart request
const MAX_FILES      = 10;

function buildFileFilter(allowedTypes) {
  const allowedSet = new Set(allowedTypes);
  return (req, file, cb) => {
    if (!allowedSet.has(file.mimetype)) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    const allowedExts = ALLOWED.get(file.mimetype);
    if (!allowedExts) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    const ext = file.originalname.toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || '';
    if (!allowedExts.includes(ext)) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    return cb(null, true);
  };
}

function makeUpload(allowedTypes) {
  for (const type of allowedTypes) {
    if (!ALLOWED.has(type)) throw new Error(`[upload] "${type}" is not in the global ALLOWED map`);
  }
  return multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter: buildFileFilter(allowedTypes),
  });
}

function wrap(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      const files = req.file ? [req.file] : (req.files ? Object.values(req.files).flat() : []);

      const totalSize = files.reduce((sum, f) => sum + (f.buffer ? f.buffer.length : 0), 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        return next(new multer.MulterError('LIMIT_FILE_SIZE'));
      }

      for (const f of files) {
        // Bytes must match the SPECIFIC mimetype the caller claimed — not merely
        // "some" recognized signature — so a relabeled file is caught even when
        // its true type happens to be allowlisted for a different field/use-case.
        if (!sniffMatchesClaimedType(f.mimetype, f.buffer)) {
          return next(new multer.MulterError('LIMIT_UNEXPECTED_FILE', f.fieldname));
        }
      }
      next();
    });
  };
}

/**
 * Per-call-site upload middleware. Every call MUST declare the exact MIME types
 * it accepts for that field — there is no more "any allowlisted type" default.
 *
 * Usage:
 *   validatedUpload.single('photo', ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
 *   validatedUpload.fields([{ name: 'invoice', maxCount: 1, allowedTypes: ['application/pdf'] }])
 */
const validatedUpload = {
  single: (fieldName, allowedTypes) => {
    if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
      throw new Error(`[upload] validatedUpload.single("${fieldName}") requires an allowedTypes array`);
    }
    return wrap(makeUpload(allowedTypes).single(fieldName));
  },
  fields: (specs) => {
    if (!Array.isArray(specs) || specs.length === 0) {
      throw new Error('[upload] validatedUpload.fields() requires a non-empty specs array');
    }
    const allowedTypes = [...new Set(specs.flatMap((s) => {
      if (!Array.isArray(s.allowedTypes) || s.allowedTypes.length === 0) {
        throw new Error(`[upload] field "${s.name}" requires an allowedTypes array`);
      }
      return s.allowedTypes;
    }))];
    const multerSpecs = specs.map(({ name, maxCount }) => ({ name, maxCount }));
    return wrap(makeUpload(allowedTypes).fields(multerSpecs));
  },
};

module.exports = { ALLOWED, validatedUpload };
