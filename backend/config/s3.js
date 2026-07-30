// AWS S3 client — plugin slot.
// Source: Product/backend/config/s3.js
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId:     process.env.S3_USER_ACCESS_KEY,
    secretAccessKey: process.env.S3_USER_SECRET,
  },
});

module.exports = s3;
