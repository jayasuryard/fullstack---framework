#!/usr/bin/env node
// Generates a Postman collection + environment file by scanning modules/ and prisma/schema.prisma.
// Usage: node scripts/generatePostman.js [CollectionName] [baseUrl]
// Output: docs/<CollectionName>_Collection.json + docs/<CollectionName>_Environment.json

const fs = require("fs");
const path = require("path");

console.log("🚀 Generating Postman Collection...");

const collectionName = process.argv[2] || "SaaS API";
const baseUrl = process.argv[3] || "{{baseUrl}}";

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
        raw:  `${baseUrl}/api/{{apiVersion}}${url}`,
        host: [baseUrl.replace("{{", "").replace("}}", "")],
        path: ["api", "{{apiVersion}}", ...url.split("/").filter((p) => p)],
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

function scanModulesForRoutes() {
  const modulesDir = path.join(__dirname, "..", "modules");

  if (!fs.existsSync(modulesDir)) {
    console.log("ℹ️  No modules directory found — generating sample requests");
    return createSampleRequests();
  }

  const modules = fs
    .readdirSync(modulesDir)
    .filter((item) =>
      fs.statSync(path.join(modulesDir, item)).isDirectory()
    );

  const requests = [];

  modules.forEach((moduleName) => {
    const routeFile = path.join(
      modulesDir,
      moduleName,
      "routes",
      `${moduleName}Routes.js`
    );

    if (fs.existsSync(routeFile)) {
      const routeContent = fs.readFileSync(routeFile, "utf8");
      const moduleRequests = parseRouteFile(moduleName, routeContent);

      if (moduleRequests.length > 0) {
        requests.push({
          name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
          item: moduleRequests,
        });
      }
    }
  });

  return requests.length > 0 ? requests : createSampleRequests();
}

function parseRouteFile(moduleName, content) {
  const requests = [];
  const cap = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  const routeRegex =
    /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const method    = match[1];
    const route     = match[2];
    const fullRoute = `/${moduleName}${route === "/" ? "" : route}`;

    switch (method.toLowerCase()) {
      case "get":
        if (route.includes(":id")) {
          requests.push(
            createRequest(
              `Get ${cap} by ID`,
              "GET",
              fullRoute.replace(":id", "{{id}}"),
              `Retrieve a specific ${moduleName} by ID`
            )
          );
        } else {
          requests.push(
            createRequest(
              `Get All ${cap}s`,
              "GET",
              fullRoute,
              `Retrieve all ${moduleName}s`
            )
          );
        }
        break;

      case "post":
        requests.push(
          createRequest(
            `Create ${cap}`,
            "POST",
            fullRoute,
            `Create a new ${moduleName}`,
            generateSampleBody(moduleName)
          )
        );
        break;

      case "put":
        requests.push(
          createRequest(
            `Update ${cap}`,
            "PUT",
            fullRoute.includes(":id")
              ? fullRoute.replace(":id", "{{id}}")
              : `${fullRoute}/{{id}}`,
            `Update an existing ${moduleName}`,
            generateSampleBody(moduleName)
          )
        );
        break;

      case "delete":
        requests.push(
          createRequest(
            `Delete ${cap}`,
            "DELETE",
            fullRoute.includes(":id")
              ? fullRoute.replace(":id", "{{id}}")
              : `${fullRoute}/{{id}}`,
            `Delete a ${moduleName} by ID`
          )
        );
        break;

      case "patch":
        requests.push(
          createRequest(
            `Partial Update ${cap}`,
            "PATCH",
            fullRoute.includes(":id")
              ? fullRoute.replace(":id", "{{id}}")
              : `${fullRoute}/{{id}}`,
            `Partially update a ${moduleName}`,
            generateSampleBody(moduleName, true)
          )
        );
        break;
    }
  }

  return requests;
}

function generateSampleBody(modelName, isPartial = false) {
  const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

  if (fs.existsSync(schemaPath)) {
    const body = parseSchemaForModel(
      modelName,
      fs.readFileSync(schemaPath, "utf8"),
      isPartial
    );
    if (body) return body;
  }

  return { name: `Sample ${modelName}`, description: `A sample ${modelName}` };
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

function createSampleRequests() {
  return [
    {
      name: "Auth",
      item: [
        createRequest("Login", "POST", "/auth/login", "Authenticate a user", {
          userName: "admin",
          password: "Password1",
        }),
        createRequest("Refresh Token", "POST", "/auth/refresh", "Refresh access token"),
        createRequest("Me", "GET", "/auth/me", "Get current user profile"),
        createRequest("Logout", "POST", "/auth/logout", "Invalidate refresh token"),
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

try {
  const collection     = createPostmanCollection(collectionName, baseUrl);
  collection.item      = scanModulesForRoutes();

  const outputDir  = path.join(__dirname, "..", "docs");
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

  console.log("✅ Postman collection generated successfully!");
  console.log(`   📁 ${outputFile}`);
  console.log(`   📁 ${envFile}`);
  console.log(`   ${collection.item.length} folders, ${totalRequests} requests`);
  console.log("\nNext: Import both files into Postman, activate the environment, set authToken.");
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
