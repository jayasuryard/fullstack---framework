#!/usr/bin/env node
// Source: Product/backend/scripts/generateModule.js (direct extraction — no changes)
const fs   = require('fs');
const path = require('path');

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('❌ Please provide a module name, e.g., npm run gen:module user');
  process.exit(1);
}

const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const rootDir     = path.join(__dirname, '..');
const moduleDir   = path.join(rootDir, 'modules', moduleName);
const routesDir   = path.join(moduleDir, 'routes');
const servicesDir = path.join(moduleDir, 'services');

[path.join(rootDir, 'modules'), moduleDir, routesDir, servicesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const routeFile = path.join(routesDir, `${moduleName}Routes.js`);
if (!fs.existsSync(routeFile)) {
  fs.writeFileSync(routeFile,
`const express = require("express");
const router = express.Router();
const { get${capitalized} } = require("../services/${capitalized}Service");

router.get("/", get${capitalized});

module.exports = router;`);
  console.log(`✅ Created ${routeFile}`);
}

const serviceFile = path.join(servicesDir, `${capitalized}Service.js`);
if (!fs.existsSync(serviceFile)) {
  fs.writeFileSync(serviceFile,
`const prisma = require("../../../config/dbConnect");
const apiResponse = require("../../../helpers/apiResponse");

async function get${capitalized}(req, res) {
  try {
    // Example: const data = await prisma.${moduleName}.findMany();
    res.json(apiResponse.response("SUCCESS", { data: "${capitalized} works!" }));
  } catch (error) {
    console.error(error);
    res.json(apiResponse.response("ERROR"));
  }
}

module.exports = { get${capitalized} };`);
  console.log(`✅ Created ${serviceFile}`);
}

const routesIndex = path.join(rootDir, 'routes', 'index.js');
let content       = fs.readFileSync(routesIndex, 'utf8');
const importLine  = `const ${moduleName}Routes = require("../modules/${moduleName}/routes/${moduleName}Routes");`;
const useLine     = `router.use("/${moduleName}", ${moduleName}Routes);`;

if (!content.includes(importLine)) {
  content = content.replace('module.exports = router;', '') +
    `\n${importLine}\n${useLine}\n\nmodule.exports = router;`;
  fs.writeFileSync(routesIndex, content);
  console.log(`✅ Updated routes/index.js with ${moduleName}`);
}
