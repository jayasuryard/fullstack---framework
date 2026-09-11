// Unit tests for middleware/upload.js — no DB/Redis required.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const multer = require('multer');
const supertest = require('supertest');
const { validatedUpload } = require('../middleware/upload');

const FIXTURES = path.join(__dirname, 'fixtures');
const read = (name) => fs.readFileSync(path.join(FIXTURES, name));

function buildApp() {
  const app = express();

  app.post(
    '/image-only',
    validatedUpload.single('file', ['image/jpeg', 'image/png']),
    (req, res) => res.status(200).json({ ok: true }),
  );
  app.post(
    '/pdf-only',
    validatedUpload.single('file', ['application/pdf']),
    (req, res) => res.status(200).json({ ok: true }),
  );
  app.post(
    '/csv-only',
    validatedUpload.single('file', ['text/csv']),
    (req, res) => res.status(200).json({ ok: true }),
  );

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code });
    return res.status(500).json({ error: 'unexpected' });
  });

  return app;
}

test('legit CSV is accepted for a field declared text/csv (previously rejected by the shared image/PDF sniffer)', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/csv-only')
    .attach('file', read('tiny.csv'), { filename: 'data.csv', contentType: 'text/csv' });
  assert.equal(res.status, 200);
});

test('binary garbage declared as text/csv is rejected by the content heuristic', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/csv-only')
    .attach('file', read('tiny.png'), { filename: 'fake.csv', contentType: 'text/csv' });
  assert.equal(res.status, 400);
});

test('legit JPEG is accepted for a field declared image/jpeg', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/image-only')
    .attach('file', read('tiny.jpg'), { filename: 'photo.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 200);
});

test('a PNG renamed to .jpg and declared image/jpeg is rejected (bytes must match the CLAIMED type)', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/image-only')
    .attach('file', read('tiny.png'), { filename: 'photo.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 400);
});

test('a field declared PDF-only rejects a valid PNG even though PNG is a real, recognized signature elsewhere', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/pdf-only')
    .attach('file', read('tiny.png'), { filename: 'doc.pdf', contentType: 'application/pdf' });
  assert.equal(res.status, 400);
});

test('a legit PDF is accepted for a field declared application/pdf', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/pdf-only')
    .attach('file', read('tiny.pdf'), { filename: 'doc.pdf', contentType: 'application/pdf' });
  assert.equal(res.status, 200);
});

test('a mimetype not in the field allowlist is rejected even if it is globally allowlisted', async () => {
  const app = buildApp();
  const res = await supertest(app)
    .post('/pdf-only')
    .attach('file', read('tiny.jpg'), { filename: 'photo.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 400);
});

test('validatedUpload.single() throws without an explicit allowedTypes array', () => {
  assert.throws(() => validatedUpload.single('file'));
});
