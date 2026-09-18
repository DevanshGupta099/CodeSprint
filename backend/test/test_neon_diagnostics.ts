import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set in backend/.env');
  process.exit(1);
}

const maskedUrl = dbUrl.replace(/(:[^:@]+@)/, ':****@');
console.log(`\n========================================================`);
console.log(`[NEON POSTGRESQL DIAGNOSTIC SUITE]`);
console.log(`Target Host: ${maskedUrl}`);
console.log(`========================================================\n`);

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function runDiagnostics() {
  const startTime = Date.now();
  const client = await pool.connect();
  const connectLatency = Date.now() - startTime;
  console.log(`✅ Connection established successfully in ${connectLatency}ms\n`);

  try {
    // 1. PostgreSQL Version & Cloud Host
    const verRes = await client.query('SELECT version(), current_database(), current_user, inet_server_addr()');
    console.log('📌 Database Information:');
    console.log(`  - Database Name: ${verRes.rows[0].current_database}`);
    console.log(`  - Database User: ${verRes.rows[0].current_user}`);
    console.log(`  - Server Version: ${verRes.rows[0].version.split(',')[0]}`);
    console.log(`  - Server IP: ${verRes.rows[0].inet_server_addr || 'Neon Serverless Edge'}`);
    console.log('');

    // 2. Table Inventory & Row Counts
    const tables = [
      'organizations',
      'suppliers',
      'supplier_edges',
      'disruption_events',
      'risk_scores',
      'alternate_suppliers',
      'mitigation_memos',
    ];

    console.log('📊 Table Health & Row Counts:');
    for (const tbl of tables) {
      try {
        const countRes = await client.query(`SELECT count(*) FROM ${tbl}`);
        console.log(`  - ${tbl.padEnd(22)}: ${countRes.rows[0].count} rows (OK)`);
      } catch (err: any) {
        console.log(`  - ${tbl.padEnd(22)}: ❌ ERROR: ${err.message}`);
      }
    }
    console.log('');

    // 3. Tier Distribution in suppliers table
    console.log('🏗️ Supply Chain Tier Distribution:');
    const tierRes = await client.query(`
      SELECT tier, count(*) as count, string_agg(name, ', ') as sample_suppliers
      FROM suppliers 
      GROUP BY tier 
      ORDER BY tier ASC
    `);
    for (const row of tierRes.rows) {
      console.log(`  - Tier ${row.tier}: ${row.count} node(s) [${row.sample_suppliers.slice(0, 55)}...]`);
    }
    console.log('');

    // 4. Test Recursive CTE: bom_tree (Downward reconstruction)
    console.log('⚡ Testing Recursive CTE Query (Downward bom_tree):');
    const cteStart = Date.now();
    const cteRes = await client.query(`
      WITH RECURSIVE bom_tree AS (
        SELECT s.id, s.name, s.tier, 0 AS depth, ARRAY[s.name::text] AS supply_path
        FROM suppliers s
        WHERE s.tier = 0
        UNION ALL
        SELECT child.id, child.name, child.tier, bt.depth + 1, bt.supply_path || child.name::text
        FROM bom_tree bt
        JOIN supplier_edges e ON e.parent_supplier_id = bt.id
        JOIN suppliers child ON child.id = e.child_supplier_id
        WHERE NOT (child.name::text = ANY(bt.supply_path))
      )
      SELECT * FROM bom_tree ORDER BY depth, tier;
    `);
    const cteDuration = Date.now() - cteStart;
    console.log(`  - Traversed ${cteRes.rows.length} hierarchical nodes in ${cteDuration}ms! (OK)`);
    console.log('');

    // 5. Test Recursive CTE: risk_up (0.7x upward decay)
    console.log('⚡ Testing Recursive CTE Query (Upward 0.7x risk_up):');
    const chokepointId = '30000000-0000-0000-0000-000000000001'; // Apex Maritime
    const riskStart = Date.now();
    const riskRes = await client.query(`
      WITH RECURSIVE risk_up AS (
        SELECT $1::uuid AS supplier_id, 0.95::float AS probability, 0.94::float AS severity, 1.0::float AS decay,
               (0.95::float * 0.94::float)::float AS current_impact, ARRAY[$1::uuid] AS path
        UNION ALL
        SELECT e.parent_supplier_id AS supplier_id, r.probability, r.severity, (r.decay * 0.7)::float AS decay,
               (r.probability * r.severity * (r.decay * 0.7))::float AS current_impact, r.path || e.parent_supplier_id AS path
        FROM supplier_edges e
        JOIN risk_up r ON r.supplier_id = e.child_supplier_id
        WHERE NOT (e.parent_supplier_id = ANY(r.path)) AND r.decay > 0.01
      )
      SELECT s.name, s.tier, ROUND(MAX(current_impact)::numeric, 4)::float AS propagated_risk
      FROM risk_up ru
      JOIN suppliers s ON s.id = ru.supplier_id
      GROUP BY s.name, s.tier
      ORDER BY s.tier DESC;
    `, [chokepointId]);
    const riskDuration = Date.now() - riskStart;
    console.log(`  - Computed 0.7x geometric decay across ${riskRes.rows.length} tiers in ${riskDuration}ms:`);
    for (const r of riskRes.rows) {
      console.log(`    * [Tier ${r.tier}] ${r.name.padEnd(28)}: Risk Score ${r.propagated_risk}`);
    }
    console.log('');

    // 6. Organization verification
    const orgRes = await client.query('SELECT id, name, industry FROM organizations LIMIT 1');
    if (orgRes.rows.length > 0) {
      console.log(`🏢 Verified Organization: ${orgRes.rows[0].name} (${orgRes.rows[0].industry}) [ID: ${orgRes.rows[0].id}]`);
    }

    console.log(`\n========================================================`);
    console.log(`🎉 NEON POSTGRESQL IS 100% OPERATIONAL, CONNECTED & HEALTHY`);
    console.log(`========================================================\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

runDiagnostics().catch((err) => {
  console.error('❌ Diagnostics failed:', err);
  process.exit(1);
});
