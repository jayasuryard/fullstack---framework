#!/usr/bin/env node
const { exec } = require('child_process');
const path     = require('path');

console.log('🚀 Deploying database migrations...');
console.log('   Applies pending migrations — does NOT create new ones.');
console.log('   For development, use: npm run gen:migration <name>\n');

exec('npx prisma migrate deploy', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) { console.error('❌ Migration deployment failed:', error.message); process.exit(1); }
  if (stderr) console.error('⚠️  Warnings:', stderr);
  console.log(stdout);
  console.log('✅ All migrations deployed successfully!');
});
