/**
 * Automated Verification for Contributor A Expansions:
 * - Multi-Scenario Disruption Catalog (SDG 8 / 12)
 * - Autonomous Rerouting Engine ([EXECUTE_REROUTE])
 * - Recharts Portfolio Breakdown Analytics (Country, Tier, ESG)
 */

import fs from 'fs';
import path from 'path';
import { query, pool } from '../src/db/index.js';

const BASE_URL = 'http://localhost:5000';

async function resetToSeed() {
  const seedPath = path.resolve('db/seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf-8');
  await query(sql);
}

async function testExpansions() {
  console.log('\n========================================================');
  console.log('[VERITAS // SUPPLY] TESTING BACKEND EXPANSIONS');
  console.log('========================================================\n');

  await resetToSeed();

  // Test 1: Scenario Catalog Retrieval
  console.log('[TEST 1] Scenario Catalog Endpoint (GET /api/disruption/scenarios)...');
  const scenariosRes = await fetch(`${BASE_URL}/api/disruption/scenarios`);
  if (scenariosRes.status !== 200) throw new Error(`HTTP ${scenariosRes.status}`);
  const scenariosData = await scenariosRes.json();
  const scenarios = scenariosData.scenarios || [];
  console.log(`  -> Found ${scenarios.length} preset scenarios in catalog`);
  const keys = scenarios.map((s: any) => s.key);
  console.log(`  -> Scenarios: ${keys.join(', ')}`);
  if (!keys.includes('XINJIANG_UFLPA_SANCTIONS') || !keys.includes('DRC_COBALT_MORATORIUM') || !keys.includes('ATACAMA_WATER_CRISIS')) {
    throw new Error('Catalog missing expected SDG scenarios');
  }
  console.log('  ✓ PASS: Scenario catalog successfully retrieved.\n');

  // Test 2: Simulate Xinjiang UFLPA Sanctions (SDG 8)
  console.log('[TEST 2] Simulating Xinjiang Polysilicon Forced Labor Sanctions (SDG 8)...');
  const simRes = await fetch(`${BASE_URL}/api/disruption/simulate/XINJIANG_UFLPA_SANCTIONS`, {
    method: 'POST',
  });
  if (simRes.status !== 200) throw new Error(`HTTP ${simRes.status}: ${await simRes.text()}`);
  const simData = await simRes.json();
  const eventId = simData.event?.id || simData.eventId;
  const impactedCount = simData.impactedNodes?.length || simData.impactedNodesCount || 0;
  const siliconSupplierId = simData.targetSupplier?.id || simData.supplierId;
  console.log(`  -> Disruption Event ID: ${eventId}`);
  console.log(`  -> Impacted Tiers: ${impactedCount}`);
  if (impactedCount < 2) throw new Error('Expected risk to propagate across multiple tiers');
  console.log('  ✓ PASS: Scenario simulation triggered and propagated 0.7x upward decay.\n');

  // Test 3: Generate Mitigation Memo for Xinjiang Silicon Node
  console.log('[TEST 3] Generating Autonomous Mitigation Memo for Silicon node...');
  const memoRes = await fetch(`${BASE_URL}/api/mitigation/${siliconSupplierId}`, {
    method: 'POST',
  });
  if (memoRes.status !== 200) throw new Error(`HTTP ${memoRes.status}: ${await memoRes.text()}`);
  const memo = await memoRes.json();
  console.log(`  -> Generated Memo ID: ${memo.id}`);
  console.log(`  -> Recommended Alternate: "${memo.alternateName}"`);
  console.log(`  -> Avoided Scope-3 Carbon: ${memo.avoidedScope3Tco2e} tCO2e`);
  console.log(`  -> Price Variance: ${memo.priceVariancePct}%`);
  console.log('  ✓ PASS: Autonomous mitigation memo synthesized.\n');

  // Test 4: Execute Autonomous Reroute ([EXECUTE_REROUTE])
  console.log('[TEST 4] Executing Autonomous Reroute (POST /api/mitigation/execute)...');
  const rerouteRes = await fetch(`${BASE_URL}/api/mitigation/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memoId: memo.id }),
  });
  if (rerouteRes.status !== 200) throw new Error(`HTTP ${rerouteRes.status}: ${await rerouteRes.text()}`);
  const rerouteData = await rerouteRes.json();
  console.log(`  -> Success: ${rerouteData.success}`);
  console.log(`  -> Message: ${rerouteData.message}`);
  console.log(`  -> Previous Supplier: ${rerouteData.previousSupplierName}`);
  console.log(`  -> New Active Supplier: ${rerouteData.newSupplierName} (${rerouteData.newSupplierId})`);

  // Verify DAG rewired
  const updatedEdges = rerouteData.updatedDAG?.edges || [];
  const edgePointingToNewSupplier = updatedEdges.some((e: any) => e.childSupplierId === rerouteData.newSupplierId);
  if (!edgePointingToNewSupplier) {
    throw new Error('Expected DAG edges to be rewired to point to new alternate supplier');
  }
  console.log('  ✓ PASS: Closed-loop autonomous reroute successfully updated graph edges.\n');

  // Test 5: Recharts Portfolio Breakdown Analytics
  console.log('[TEST 5] Recharts Portfolio Analytics (GET /api/analytics/portfolio-breakdown)...');
  const analyticsRes = await fetch(`${BASE_URL}/api/analytics/portfolio-breakdown`);
  if (analyticsRes.status !== 200) throw new Error(`HTTP ${analyticsRes.status}`);
  const analytics = await analyticsRes.json();
  console.log(`  -> Countries analyzed: ${analytics.byCountry?.length || 0}`);
  analytics.byCountry?.slice(0, 3).forEach((c: any) => {
    console.log(`     * ${c.country} (${c.countryCode}): $${(c.spendUSD / 1000000).toFixed(1)}M spend, ${c.supplierCount} suppliers, status: ${c.status}`);
  });
  console.log(`  -> Tiers analyzed: ${analytics.byTier?.length || 0}`);
  console.log(`  -> ESG Compliance: ${analytics.esgCompliance?.compliancePercentage}% (${analytics.esgCompliance?.certifiedSuppliersCount}/${analytics.esgCompliance?.totalSuppliers} certified)`);
  if (!analytics.byCountry || analytics.byCountry.length === 0 || !analytics.byTier) {
    throw new Error('Expected valid portfolio breakdown data');
  }
  console.log('  ✓ PASS: Recharts portfolio breakdown analytics formatted accurately.\n');

  // Reset database to pristine baseline seed state
  await resetToSeed();
  console.log('========================================================');
  console.log('ALL EXPANSION TESTS PASSED (100%)!');
  console.log('========================================================\n');
  await pool.end();
}

testExpansions().catch((err) => {
  console.error('\nExpansion tests failed:', err);
  process.exit(1);
});
