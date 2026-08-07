#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const modelName = process.argv[2];
const fields    = process.argv.slice(3);

if (!modelName) {
  console.error('❌ Please provide a model name, e.g., npm run gen:model Post title:String content:String');
  console.error('📋 Field types: String, Int, Float, Boolean, DateTime, Json, Decimal, BigInt, Bytes');
  console.error('📋 Modifiers:   ? (optional), [] (array), @unique, @default()');
  process.exit(1);
}

const VALID_TYPES = new Set(['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'BigInt', 'Bytes']);

const capitalized  = modelName.charAt(0).toUpperCase() + modelName.slice(1);
const schemaPath   = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function parseField(fieldStr) {
  const [nameType, ...modifiers] = fieldStr.split('@');
  const [name, type] = nameType.split(':');
  if (!name || !type) {
    console.error(`❌ Invalid field format: ${fieldStr}. Use format: fieldName:Type`);
    return null;
  }
  let prismaType  = type;
  const fieldMods = [];
  if (prismaType.endsWith('?')) { prismaType = prismaType.slice(0, -1); fieldMods.push('?'); }
  if (prismaType.endsWith('[]')) { prismaType = prismaType.slice(0, -2); fieldMods.push('[]'); }
  if (!VALID_TYPES.has(prismaType)) {
    console.error(`❌ Unknown Prisma type '${type}' in '${fieldStr}'. Valid: ${[...VALID_TYPES].join(', ')}`);
    return null;
  }
  if (modifiers.length > 0)    { fieldMods.push(`@${modifiers.join('@')}`); }
  return `  ${name.padEnd(12)} ${prismaType}${fieldMods.join(' ')}`;
}

const defaultFields = [
  '  id          String   @id @default(cuid())',
  '  createdAt   DateTime @default(now())',
  '  updatedAt   DateTime @updatedAt',
];
const parsedFields = fields.map(parseField);
if (parsedFields.some(f => f === null)) {
  // parseField already printed the offending field(s); bail before touching schema.
  process.exit(1);
}
const customFields = parsedFields;
const allFields    = [...defaultFields, ...customFields];

const modelDefinition = `\nmodel ${capitalized} {\n${allFields.join('\n')}\n}`;

let schemaContent = '';
if (fs.existsSync(schemaPath)) {
  schemaContent = fs.readFileSync(schemaPath, 'utf8');
} else {
  console.error('❌ schema.prisma not found');
  process.exit(1);
}

if (schemaContent.includes(`model ${capitalized} {`)) {
  console.error(`❌ Model ${capitalized} already exists in schema.prisma`);
  process.exit(1);
}

const originalContent = schemaContent;
fs.writeFileSync(schemaPath, schemaContent.trimEnd() + modelDefinition + '\n');

// Reject invalid models: roll back the write and fail loudly if the schema
// doesn't validate, so a typo never leaves the repo broken.
// Validate only resolves the URL — no DB connection. Fallback URL lets the
// check run without .env (fresh clone, CI); the schema text is all that matters.
try {
  execSync('npx prisma validate', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'postgresql://validate:validate@localhost:5432/validate' },
  });
} catch (error) {
  fs.writeFileSync(schemaPath, originalContent);
  console.error(`❌ Schema invalid — rolled back. Validation output:\n${error.stderr || error.message}`);
  process.exit(1);
}

console.log(`✅ Added model ${capitalized} to schema.prisma`);
allFields.forEach(f => console.log(`   ${f.trim()}`));
console.log(`\n🔄 Run 'npm run gen:migration add_${modelName.toLowerCase()}_table' to create migration`);
