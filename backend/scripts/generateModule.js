#!/usr/bin/env node
// Scaffolds a new module: routes + service + a basic negative test, and mounts it
// in routes/index.js. PROTECTED BY DEFAULT — verifyToken + role('admin') are wired
// into the generated router unless --public is passed explicitly.
//
// Usage:
//   npm run gen:module <name>            # protected (default)
//   npm run gen:module <name> -- --public   # explicitly unauthenticated
const fs   = require('fs');
const path = require('path');

const args      = process.argv.slice(2);
const isPublic  = args.includes('--public');
const moduleName = args.find((a) => !a.startsWith('--'));

if (!moduleName) {
  console.error('❌ Please provide a module name, e.g., npm run gen:module user');
  console.error('   Pass --public to scaffold an intentionally unauthenticated module (rare — auth-style endpoints only).');
  process.exit(1);
}

// kebab-case / alphanumeric only — this string is used to build filesystem paths,
// so path traversal characters (`.`, `/`, `\`) and anything else must be rejected
// before it ever touches fs.mkdirSync/writeFileSync.
const NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
if (!NAME_RE.test(moduleName)) {
  console.error(`❌ Invalid module name "${moduleName}". Use lowercase alphanumeric kebab-case, e.g. "invoice-item".`);
  process.exit(1);
}

const camel       = moduleName.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const capitalized = camel.charAt(0).toUpperCase() + camel.slice(1);
const rootDir      = path.join(__dirname, '..');
const moduleDir    = path.join(rootDir, 'modules', moduleName);
const routesDir     = path.join(moduleDir, 'routes');
const servicesDir   = path.join(moduleDir, 'services');
const routeFile     = path.join(routesDir, `${camel}Routes.js`);
const serviceFile   = path.join(servicesDir, `${capitalized}Service.js`);
const testFile       = path.join(rootDir, 'tests', `${moduleName}.generated.test.js`);
const routesIndex    = path.join(rootDir, 'routes', 'index.js');

// Refuse to clobber an existing module — a re-run with the same name should not
// silently overwrite hand-edited files, and a failed generation should not leave
// a half-written module mounted in routes/index.js.
for (const f of [routeFile, serviceFile, testFile]) {
  if (fs.existsSync(f)) {
    console.error(`❌ ${path.relative(rootDir, f)} already exists. Choose a different name or remove it first.`);
    process.exit(1);
  }
}

const routeContent = isPublic
  ? `const express = require("express");
const router = express.Router();
const { validateBody, z } = require("../../../middleware/validate");
const { get${capitalized} } = require("../services/${capitalized}Service");

// PUBLIC MODULE — generated with --public, no auth applied. Confirm this is
// intentional (e.g. a public status page) before shipping.

// Fill in real fields — this is a passthrough placeholder so the route has
// SOME validation out of the box rather than none.
const list${capitalized}Schema = z.object({});

router.get("/", validateBody(list${capitalized}Schema), get${capitalized});

module.exports = router;
`
  : `const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const role = require("../../../middleware/role");
const { validateBody, z } = require("../../../middleware/validate");
const { get${capitalized} } = require("../services/${capitalized}Service");

// Fill in real fields — this is a passthrough placeholder so the route has
// SOME validation out of the box rather than none.
const list${capitalized}Schema = z.object({});

router.get("/", verifyToken, role("admin"), validateBody(list${capitalized}Schema), get${capitalized});

module.exports = router;
`;

const serviceContent = `const prisma = require("../../../config/dbConnect");
const apiResponse = require("../../../helpers/apiResponse");

async function get${capitalized}(req, res) {
  try {
    // Example: const data = await prisma.${camel}.findMany();
    return apiResponse.send(res, "SUCCESS", { data: "${capitalized} works!" });
  } catch (error) {
    console.error(error);
    return apiResponse.send(res, "SERVER_ERROR");
  }
}

module.exports = { get${capitalized} };
`;

const testContent = `// Generated negative-auth test for the "${moduleName}" module.
// Extend with real coverage as the module grows.
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const supertest = require('supertest');
const apiResponse = require('../helpers/apiResponse');
const ${camel}Routes = require('../modules/${moduleName}/routes/${camel}Routes');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/${moduleName}', ${camel}Routes);
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    return apiResponse.send(res, 'SERVER_ERROR');
  });
  return app;
}

test('GET /${moduleName} without a token${isPublic ? ' succeeds (module generated with --public)' : ' → 401'}', async () => {
  const app = buildApp();
  const res = await supertest(app).get('/${moduleName}');
  ${isPublic ? "assert.notEqual(res.status, 401);" : "assert.equal(res.status, 401);"}
});
`;

// Write files, tracking what succeeded so a mid-failure can be rolled back
// instead of leaving a half-written module on disk.
const written = [];
try {
  [path.join(rootDir, 'modules'), moduleDir, routesDir, servicesDir].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  fs.writeFileSync(routeFile, routeContent);
  written.push(routeFile);
  console.log(`✅ Created ${path.relative(rootDir, routeFile)}`);

  fs.writeFileSync(serviceFile, serviceContent);
  written.push(serviceFile);
  console.log(`✅ Created ${path.relative(rootDir, serviceFile)}`);

  fs.writeFileSync(testFile, testContent);
  written.push(testFile);
  console.log(`✅ Created ${path.relative(rootDir, testFile)}`);

  const original = fs.readFileSync(routesIndex, 'utf8');
  const importLine = `const ${camel}Routes = require("../modules/${moduleName}/routes/${camel}Routes");`;
  const useLine     = `router.use("/${moduleName}", ${camel}Routes);`;

  if (original.includes(importLine)) {
    throw new Error(`routes/index.js already imports ${camel}Routes`);
  }

  const updated = original.replace('module.exports = router;', '').trimEnd() +
    `\n\n${importLine}\n${useLine}\n\nmodule.exports = router;\n`;
  fs.writeFileSync(routesIndex, updated);
  console.log(`✅ Updated routes/index.js with ${moduleName}${isPublic ? ' (PUBLIC — no verifyToken)' : ' (protected: verifyToken + role("admin"))'}`);
} catch (error) {
  console.error(`❌ Generation failed: ${error.message}`);
  for (const f of written) {
    try { fs.unlinkSync(f); } catch { /* best-effort cleanup */ }
  }
  console.error('   Rolled back partially written files.');
  process.exit(1);
}
