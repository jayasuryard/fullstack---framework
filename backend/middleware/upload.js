/**
 * File upload middleware (multer, memory storage).
 * Files are buffered in memory (req.file.buffer) so they can be streamed
 * directly to S3 or Cloudinary without writing to disk.
 * Default limit: 5 MB per file.
 *
 * Security: strict allowlist by MIME + extension, plus magic-byte sniffing for
 * images/PDF. SVG is deliberately rejected (stored-XSS vector via hosted SVG).
 * Rejected files fail with a MulterError → mapped to HTTP 400 by the error handler.
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

// Magic bytes: JPEG FF D8 FF, PNG 89 50 4E 47, GIF "GIF8", WebP "RIFF....WEBP",
// PDF "%PDF". Images and PDFs get sniffed; others trust MIME + extension.
function sniff(buffer) {
  if (!buffer || buffer.length < 12) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;                       // jpeg
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true; // png
  if (buffer.toString('ascii', 0, 4) === 'GIF8') return true;                                            // gif
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return true;
  if (buffer.toString('ascii', 0, 5) === '%PDF-') return true;
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedExts = ALLOWED.get(file.mimetype);
    if (!allowedExts) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    const ext = file.originalname.toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1] || '';
    if (!allowedExts.includes(ext)) return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));

    // Defer magic-byte sniff until the buffer exists (memory storage).
    file.sniff = sniff;
    return cb(null, true);
  },
});

// Post-buffer validation: images/PDFs must match magic bytes, not just the claimed MIME.
// Usage: validatedUpload.single('photo') | validatedUpload.fields([{ name: 'doc', maxCount: 1 }])
const validatedUpload = {
  single: (fieldName) => wrap(upload.single(fieldName)),
  fields: (spec)      => wrap(upload.fields(spec)),
};

function wrap(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      const files = req.file ? [req.file] : (req.files ? Object.values(req.files).flat() : []);
      for (const f of files) {
        if (f.sniff && !f.sniff(f.buffer)) {
          return next(new multer.MulterError('LIMIT_UNEXPECTED_FILE', f.fieldname));
        }
      }
      next();
    });
  };
}

module.exports = { upload, validatedUpload };