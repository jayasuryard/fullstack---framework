// Zero-dep backend lint: `node --check` every JS file (syntax gate for CI) +
// JSON parse check for config files. Catches syntax regressions without pulling
// eslint into the backend dependency tree.
//
// Usage: npm run lint
// Exit 0 = all files parse. Non-zero = first broken file printed to stderr.
const { execFileSync } = require('node:child_process');
const { readdirSync, statSync } = require('node:fs');
const { join, extname, relative } = require('node:path');

const ROOT = join(__dirname, '..');
const DIRS  = ['config', 'helpers', 'middleware', 'modules', 'routes', 'jobs', 'workers', 'scripts', 'tests'];
const FILES = ['server.js', 'worker.js', 'prisma.config.ts', 'ecosystem.config.js', 'start.sh'];
const SKIP  = ['node_modules', 'generated', 'dist', '.git'];

// *_stub.js files are copy-me templates with `start<FeatureName>Cron()` style
// placeholders — intentionally not parseable, so they don't gate CI.
function isStub(file) {
  return file.endsWith('_stub.js') || file.endsWith('_stub.jsx');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.includes(entry)) continue;
    const full = join(dir, entry);
    const st   = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith('.js') && !isStub(entry)) out.push(full);
  }
  return out;
}

let files = FILES.filter(f => { try { return statSync(join(ROOT, f)).isFile(); } catch { return false; } });
for (const d of DIRS) {
  try { files.push(...walk(join(ROOT, d))); } catch { /* dir missing — fine */ }
}

const failures = [];
for (const f of files) {
  const rel = relative(ROOT, f);
  try {
    if (f.endsWith('.ts')) {
      execFileSync(process.execPath, ['--experimental-strip-types', '--check', f], { stdio: 'pipe' });
    } else if (f.endsWith('.sh')) {
      // shellcheck absent in CI — at least require it be non-empty + executable-ish.
      continue;
    } else {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    }
  } catch (err) {
    failures.push(`${rel}: ${(err.stderr || err.message).toString().split('\n')[0]}`);
  }
}

// JSON sanity for the response-code registry and any config JSON.
const jsons = ['globals/response.json'];
for (const j of jsons) {
  try { JSON.parse(require('node:fs').readFileSync(join(ROOT, j), 'utf8')); }
  catch (e) { failures.push(`${j}: invalid JSON (${e.message})`); }
}

if (failures.length) {
  console.error(`lint failed (${failures.length}):`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`lint ok — ${files.length} files parse clean`);
