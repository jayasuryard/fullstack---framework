#!/usr/bin/env node
// Source: Product/backend/scripts/generateMigration.js (direct extraction — no changes)
const { exec } = require('child_process');
const path     = require('path');

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('❌ Please provide a migration name, e.g., npm run gen:migration add_posts_table');
  process.exit(1);
}
if (!/^[a-zA-Z0-9_]+$/.test(migrationName)) {
  console.error('❌ Migration name must contain only letters, numbers, and underscores');
  process.exit(1);
}

console.log(`🚀 Generating migration: ${migrationName}`);
const command = `npx prisma migrate dev --name ${migrationName}`;
console.log(`⏳ Running: ${command}\n`);

exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) { console.error('❌ Migration failed:', error.message); return; }
  if (stderr) console.error('⚠️  Warnings:', stderr);
  console.log(stdout);
  console.log(`✅ Migration '${migrationName}' completed successfully!`);
});
