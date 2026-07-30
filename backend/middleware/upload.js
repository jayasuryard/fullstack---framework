/**
 * File upload middleware (multer, memory storage).
 * Files are buffered in memory (req.file.buffer) so they can be streamed
 * directly to S3 or Cloudinary without writing to disk.
 * Default limit: 5 MB per file.
 */
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
