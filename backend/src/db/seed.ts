import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed(): Promise<void> {
  console.log('=== [VERITAS SUPPLY] SEEDING DATABASE ===');

  // Search for schema.sql and seed.sql in possible locations
  const possibleSchemaPaths = [
    path.resolve(__dirname, '../../db/schema.sql'),
    path.resolve(process.cwd(), 'db/schema.sql'),
    path.resolve(process.cwd(), 'backend/db/schema.sql'),
  ];

  const possibleSeedPaths = [
    path.resolve(__dirname, '../../db/seed.sql'),
    path.resolve(process.cwd(), 'db/seed.sql'),
    path.resolve(process.cwd(), 'backend/db/seed.sql'),
  ];

  const schemaPath = possibleSchemaPaths.find((p) => fs.existsSync(p));
  const seedPath = possibleSeedPaths.find((p) => fs.existsSync(p));

  if (!schemaPath || !seedPath) {
    throw new Error(`Schema or seed SQL file not found. Schema: ${schemaPath}, Seed: ${seedPath}`);
  }

  console.log(`Applying schema: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await query(schemaSql);
  console.log('✓ Schema applied successfully.');

  console.log(`Applying seed data: ${seedPath}`);
  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  await query(seedSql);
  console.log('✓ Seed data populated successfully.');

  // Validate seeded count
  const orgCheck = await query('SELECT count(*) as count FROM organizations');
  const supCheck = await query('SELECT count(*) as count FROM suppliers');
  const edgeCheck = await query('SELECT count(*) as count FROM supplier_edges');
  const altCheck = await query('SELECT count(*) as count FROM alternate_suppliers');

  console.log(`\n=== SEED VALIDATION SUMMARY ===`);
  console.log(`Organizations:       ${orgCheck.rows[0].count}`);
  console.log(`Suppliers (T0-T4):   ${supCheck.rows[0].count}`);
  console.log(`Supplier Edges:      ${edgeCheck.rows[0].count}`);
  console.log(`Alternate Suppliers: ${altCheck.rows[0].count}`);
  console.log('===============================\n');
}

// If executed directly from command line
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(() => {
      console.log('[SUCCESS] Database seeded cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[ERROR] Database seed failed:', err);
      process.exit(1);
    });
}
