#!/usr/bin/env node
// Generates a Postman collection + environment file by scanning modules/ and prisma/schema.prisma.
// Usage: node scripts/generatePostman.js [CollectionName] [baseUrl]
// Output: docs/<CollectionName>_Collection.json + docs/<CollectionName>_Environment.json

const fs = require("fs");
const path = require("path");

const collectionName = process.argv[2] || "SaaS API";
const baseUrl = process.argv[3] || "{{baseUrl}}";

const ROOT           = path.join(__dirname, "..");
const ROUTES_INDEX   = path.join(ROOT, "routes", "index.js");
const SERVER_FILE    = path.join(ROOT, "server.js");

function createPostmanCollection(name, baseUrl) {
  return {
    info: {
      name,
      description: `API collection for ${name}`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _exporter_id: "saas-framework-generator",
    },
    item: [],
    variable: [
      { key: "baseUrl",    value: "http://localhost:3000", type: "string" },
      { key: "apiVersion", value: "v1",                   type: "string" },
    ],
    auth: {
      type: "bearer",
      bearer: [{ key: "token", value: "{{authToken}}", type: "string" }],
    },
    event: [
      {
        listen: "prerequest",
        script: {
          type: "text/javascript",
          exec: [
            "console.log('Making request to:', pm.request.url.toString());",
          ],
        },
      },
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "pm.test('Status code is success', function () {",
            "    pm.response.to.have.status.that.is.oneOf([200, 201, 204]);",
            "});",
            "pm.test('Response time is less than 2000ms', function () {",
            "    pm.expect(pm.response.responseTime).to.be.below(2000);",
            "});",
          ],
        },
      },
    ],
  };
}

function createRequest(name, method, url, description, body = null, headers = []) {
  const request = {
    name,
    request: {
      method: method.toUpperCase(),
      header: [
        { key: "Content-Type", value: "application/json", type: "text" },
        ...headers,
      ],
      url: {
        raw:  `${baseUrl}${url}`,
        host: [baseUrl.replace("{{", "").replace("}}", "")],
        path: url.split("/").filter((p) => p),
      },
    },
    response: [],
  };

  if (
    body &&
    ["post", "put", "patch"].includes(method.toLowerCase())
  ) {
    request.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: { raw: { language: "json" } },
    };
  }

  if (description) request.request.description = description;

  return request;
}

// ── Mount-path resolution ───────────────────────────────────────────────────────
// routes/index.js is the ONE place module routers actually get mounted (server.js
// then mounts that aggregator at a single API-wide prefix). Reading it directly —
// instead of guessing a mount path from a module's folder name — is what keeps
// this generator from drifting out of sync with the real app: e.g. the auth
// module's folder is "auth" but it's actually mounted at "/common/auth".

// Finds `app.use('/api/v1', routes)` (or similar) in server.js. Falls back to
// "/api/v1" — the project convention documented in routes/index.js — if server.js
// can't be read or doesn't match, so the generator still degrades gracefully.
function resolveApiPrefix() {
  const fallback = "/api/v1";
  if (!fs.existsSync(SERVER_FILE)) return fallback;
  const content = fs.readFileSync(SERVER_FILE, "utf8");
  const match = /app\.use\(\s*["'](\/[^"']*)["']\s*,\s*routes\s*\)/.exec(content);
  return match ? match[1] : fallback;
}

// Maps module folder name → the real mount path it's registered at in
// routes/index.js, by cross-referencing each `require(".../modules/<name>/routes/...")`
// variable with the `router.use("<mountPath>", ...middlewares, <variable>)` call
// that actually uses it.
function resolveMountPaths() {
  const map = {};
  if (!fs.existsSync(ROUTES_INDEX)) return map;
  const content = fs.readFileSync(ROUTES_INDEX, "utf8");

  const varToModule = {};
  const requireRe = /const\s+(\w+)\s*=\s*require\(\s*["'][^"']*\/modules\/([^"'/]+)\/routes\/[^"']+["']\s*\)/g;
  let m;
  while ((m = requireRe.exec(content)) !== null) {
    varToModule[m[1]] = m[2];
  }

  const useRe = /router\.use\(\s*["']([^"']+)["']\s*,\s*(.+?)\)\s*;/g;
  while ((m = useRe.exec(content)) !== null) {
    const mountPath = m[1];
    const args = m[2].split(",").map((s) => s.trim());
    const routerVar = args[args.length - 1];
    const moduleName = varToModule[routerVar];
    if (moduleName) map[moduleName] = mountPath;
  }

  return map;
}

// ── Zod schema introspection ────────────────────────────────────────────────────
// Route files keep their validation schemas as local `z.object({ ... })` consts
// (see modules/auth/routes/authRoutes.js) — they aren't exported, so we can't
// `require()` the file and walk `.shape` without changing that module. Instead we
// statically parse the schema literal out of the route file's source text and
// infer one plausible example value per field from its zod chain. This keeps
// example bodies in sync with the ACTUAL validation without touching auth files.
function extractZodSchemas(content) {
  const schemas = {};
  const schemaRe = /const\s+(\w+)\s*=\s*z\.object\(\{([\s\S]*?)\}\)\s*;/g;
  let m;
  while ((m = schemaRe.exec(content)) !== null) {
    const [, schemaName, body] = m;
    const fields = {};
    const fieldRe = /(\w+)\s*:\s*(.+?),?\s*$/gm;
    let fm;
    while ((fm = fieldRe.exec(body)) !== null) {
      fields[fm[1]] = fm[2].trim();
    }
    schemas[schemaName] = fields;
  }
  return schemas;
}

function zodFieldExample(fieldName, chain) {
  const lower = fieldName.toLowerCase();

  if (/\.email\(/.test(chain)) return "user@example.com";

  const digitRun = /\.regex\(\s*\/\^\\d\{(\d+)\}\$\//.exec(chain);
  if (digitRun) return "1".repeat(Number(digitRun[1]));

  if (lower.includes("password")) return "SecurePass123!";
  if (/^z\.number\(/.test(chain)) return 42;
  if (/^z\.boolean\(/.test(chain)) return true;
  if (/^z\.string\(/.test(chain)) return `Sample ${fieldName}`;
  return `sample-${fieldName}`;
}

function buildExampleBodyFromSchema(fields) {
  const body = {};
  for (const [fieldName, chain] of Object.entries(fields)) {
    body[fieldName] = zodFieldExample(fieldName, chain);
  }
  return body;
}

function scanModulesForRoutes(mountPaths, apiPrefix) {
  const modulesDir = path.join(ROOT, "modules");

  if (!fs.existsSync(modulesDir)) {
    console.log("ℹ️  No modules directory found — generating sample requests");
    return createSampleRequests();
  }

  const modules = fs
    .readdirSync(modulesDir)
    .filter((item) => fs.statSync(path.join(modulesDir, item)).isDirectory());

  const requests = [];

  modules.forEach((moduleName) => {
    const mountPath = mountPaths[moduleName];
    if (!mountPath) {
      console.log(`ℹ️  Skipping "${moduleName}" — not mounted in routes/index.js, so it isn't part of the live API`);
      return;
    }

    const camel = moduleName.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    const candidateFiles = [
      path.join(modulesDir, moduleName, "routes", `${moduleName}Routes.js`),
      path.join(modulesDir, moduleName, "routes", `${camel}Routes.js`),
    ];
    const routeFile = candidateFiles.find((f) => fs.existsSync(f));
    if (!routeFile) return;

    const routeContent = fs.readFileSync(routeFile, "utf8");
    const moduleRequests = parseRouteFile(moduleName, routeContent, mountPath, apiPrefix);

    if (moduleRequests.length > 0) {
      requests.push({
        name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
        item: moduleRequests,
      });
    }
  });

  return requests.length > 0 ? requests : createSampleRequests();
}

function parseRouteFile(moduleName, content, mountPath, apiPrefix) {
  const requests = [];
  const cap = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const schemas = extractZodSchemas(content);

  const lines = content.split("\n");
  const routeLineRe = /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']([^;]*)\)\s*;/i;

  for (const line of lines) {
    const match = routeLineRe.exec(line);
    if (!match) continue;

    const method  = match[1].toLowerCase();
    const route   = match[2];
    const rest    = match[3] || "";
    const fullRoute = `${apiPrefix}${mountPath}${route === "/" ? "" : route}`;

    const schemaMatch = /validateBody\(\s*(\w+)\s*\)/.exec(rest);
    const schemaFields = schemaMatch ? schemas[schemaMatch[1]] : null;
    // A multipart route (validatedUpload) doesn't take a JSON body at all. Prefer
    // the real zod schema when one is wired up; otherwise fall back to a matching
    // Prisma model shape; and if neither exists, send {} rather than a fabricated
    // placeholder body for a model the route has nothing to do with.
    const isMultipart = /validatedUpload/.test(rest);
    const resolveBody = (isPartial = false) => {
      if (isMultipart) return null;
      if (schemaFields) return buildExampleBodyFromSchema(schemaFields);
      return generateSampleBody(moduleName, isPartial) || {};
    };

    switch (method) {
      case "get":
        if (route.includes(":id")) {
          requests.push(createRequest(`Get ${cap} by ID`, "GET", fullRoute.replace(":id", "{{id}}"), `Retrieve a specific ${moduleName} by ID`));
        } else {
          requests.push(createRequest(`Get All ${cap}s`, "GET", fullRoute, `Retrieve all ${moduleName}s`));
        }
        break;

      case "post":
        requests.push(createRequest(
          humanizeRouteName(route, cap, "Create"),
          "POST",
          fullRoute,
          `POST ${moduleName}${route === "/" ? "" : route}`,
          resolveBody(),
        ));
        break;

      case "put":
        requests.push(createRequest(
          `Update ${cap}`,
          "PUT",
          route.includes(":id") ? fullRoute.replace(":id", "{{id}}") : `${fullRoute}/{{id}}`,
          `Update an existing ${moduleName}`,
          resolveBody(),
        ));
        break;

      case "delete":
        requests.push(createRequest(
          `Delete ${cap}`,
          "DELETE",
          route.includes(":id") ? fullRoute.replace(":id", "{{id}}") : `${fullRoute}/{{id}}`,
          `Delete a ${moduleName} by ID`,
        ));
        break;

      case "patch":
        requests.push(createRequest(
          `Partial Update ${cap}`,
          "PATCH",
          route.includes(":id") ? fullRoute.replace(":id", "{{id}}") : `${fullRoute}/{{id}}`,
          `Partially update a ${moduleName}`,
          resolveBody(true),
        ));
        break;
    }
  }

  return requests;
}

// A route like POST /forgot-password should read as "Forgot Password", not
// "Create Auth" — fall back to "Create <Module>" only for the bare "/" route.
function humanizeRouteName(route, cap, verbForRoot) {
  if (route === "/") return `${verbForRoot} ${cap}`;
  const words = route.replace(/^\//, "").split(/[-/]/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function generateSampleBody(modelName, isPartial = false) {
  const schemaPath = path.join(ROOT, "prisma", "schema.prisma");

  if (fs.existsSync(schemaPath)) {
    const body = parseSchemaForModel(
      modelName,
      fs.readFileSync(schemaPath, "utf8"),
      isPartial
    );
    if (body) return body;
  }

  // No zod schema and no matching Prisma model — don't fabricate fields for an
  // unrelated shape; let the caller default to {}.
  return null;
}

function parseSchemaForModel(modelName, schemaContent, isPartial = false) {
  const cap        = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const modelRegex = new RegExp(`model\\s+${cap}\\s*{([^}]+)}`, "i");
  const match      = modelRegex.exec(schemaContent);

  if (!match) return null;

  const modelBody  = match[1];
  const fields     = {};
  const fieldRegex = /(\w+)\s+(\w+)(\[\]|\?)?/g;
  let fieldMatch;

  while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
    const fieldName  = fieldMatch[1];
    const fieldType  = fieldMatch[2];
    const isOptional = fieldMatch[3] === "?";
    const isArray    = fieldMatch[3] === "[]";

    if (["id", "createdAt", "updatedAt"].includes(fieldName)) continue;
    if (isPartial && isOptional && Math.random() > 0.5) continue;

    switch (fieldType.toLowerCase()) {
      case "string":
        if (fieldName.toLowerCase().includes("email")) {
          fields[fieldName] = "user@example.com";
        } else if (fieldName.toLowerCase().includes("name")) {
          fields[fieldName] = "Sample Name";
        } else {
          fields[fieldName] = isArray ? ["sample", "data"] : "Sample string";
        }
        break;
      case "int":
        fields[fieldName] = isArray ? [1, 2, 3] : 42;
        break;
      case "float":
        fields[fieldName] = isArray ? [1.1, 2.2] : 3.14;
        break;
      case "boolean":
        fields[fieldName] = isArray ? [true, false] : true;
        break;
      case "datetime":
        fields[fieldName] = isArray
          ? ["2024-01-01T00:00:00Z"]
          : "2024-01-01T00:00:00Z";
        break;
      case "json":
        fields[fieldName] = isArray ? [{ key: "value" }] : { key: "value" };
        break;
      default:
        fields[fieldName] = isArray ? ["sample"] : "sample";
    }
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

function createSampleRequests(apiPrefix = "/api/v1") {
  return [
    {
      name: "Auth",
      item: [
        createRequest("Login", "POST", `${apiPrefix}/common/auth/login`, "Authenticate a user", {
          userName: "admin",
          password: "Password1",
        }),
        createRequest("Refresh Token", "POST", `${apiPrefix}/common/auth/refresh`, "Refresh access token"),
        createRequest("Me", "GET", `${apiPrefix}/common/auth/me`, "Get current user profile"),
        createRequest("Logout", "POST", `${apiPrefix}/common/auth/logout`, "Invalidate refresh token"),
      ],
    },
    {
      name: "Health",
      item: [
        createRequest("Health Check", "GET", "/health", "Check API status"),
      ],
    },
  ];
}

function generate() {
  const apiPrefix  = resolveApiPrefix();
  const mountPaths = resolveMountPaths();

  const collection = createPostmanCollection(collectionName, baseUrl);
  collection.item  = scanModulesForRoutes(mountPaths, apiPrefix);

  const outputDir  = path.join(ROOT, "docs");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const safeCollName = collectionName.replace(/\s+/g, "_");
  const outputFile   = path.join(outputDir, `${safeCollName}_Collection.json`);
  fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));

  const environment = {
    id:   "saas-framework-env",
    name: `${collectionName} Environment`,
    values: [
      { key: "baseUrl",    value: "http://localhost:3000",   enabled: true },
      { key: "apiVersion", value: "v1",                      enabled: true },
      { key: "authToken",  value: "your-jwt-token-here",     enabled: true },
      { key: "id",         value: "replace-with-a-real-id",  enabled: true },
    ],
    _postman_variable_scope: "environment",
  };

  const envFile = path.join(outputDir, `${safeCollName}_Environment.json`);
  fs.writeFileSync(envFile, JSON.stringify(environment, null, 2));

  const totalRequests = collection.item.reduce(
    (sum, folder) => sum + (folder.item?.length || 0),
    0
  );

  return { outputFile, envFile, folders: collection.item.length, totalRequests };
}

if (require.main === module) {
  console.log("🚀 Generating Postman Collection...");
  try {
    const { outputFile, envFile, folders, totalRequests } = generate();
    console.log("✅ Postman collection generated successfully!");
    console.log(`   📁 ${outputFile}`);
    console.log(`   📁 ${envFile}`);
    console.log(`   ${folders} folders, ${totalRequests} requests`);
    console.log("\nNext: Import both files into Postman, activate the environment, set authToken.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

module.exports = {
  generate,
  resolveApiPrefix,
  resolveMountPaths,
  extractZodSchemas,
  zodFieldExample,
  buildExampleBodyFromSchema,
  parseRouteFile,
};
