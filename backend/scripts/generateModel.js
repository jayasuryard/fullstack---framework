#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const modelName = process.argv[2];
const fields    = process.argv.slice(3);

if (!modelName) {
  console.error('❌ Please provide a model name, e.g., npm run gen:model Post title:String content:String');
  console.error('📋 Field types: String, Int, Float, Boolean, DateTime, Json');
  console.error('📋 Modifiers:   ? (optional), [] (array), @unique, @default()');
  process.exit(1);
}

const capitalized  = modelName.charAt(0).toUpperCase() + modelName.slice(1);
const schemaPath   = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function parseField(fieldStr) {
  const [nameType, ...modifiers] = fieldStr.split('@');
  const [name, type] = nameType.split(':');
  if (!name || !type) {
    console.error(`❌ Invalid field format: ${fieldStr}. Use format: fieldName:Type`);
    return null;
  }
  let prismaType    = type;
  const fieldMods   = [];
  if (prismaType.endsWith('?')) { prismaType = prismaType.slice(0, -1); fieldMods.push('?'); }
  if (modifiers.length > 0)    { fieldMods.push(`@${modifiers.join('@')}`); }
  return `  ${name.padEnd(12)} ${prismaType}${fieldMods.join(' ')}`;
}

const defaultFields = [
  '  id          String   @id @default(cuid())',
  '  createdAt   DateTime @default(now())',
  '  updatedAt   DateTime @updatedAt',
];
const customFields = fields.map(parseField).filter(Boolean);
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

fs.writeFileSync(schemaPath, schemaContent.trimEnd() + modelDefinition + '\n');

console.log(`✅ Added model ${capitalized} to schema.prisma`);
allFields.forEach(f => console.log(`   ${f.trim()}`));
console.log(`\n🔄 Run 'npm run gen:migration add_${modelName.toLowerCase()}_table' to create migration`);
