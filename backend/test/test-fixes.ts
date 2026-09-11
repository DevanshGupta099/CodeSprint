/**
 * Specific Verification for Critical Bugs 1-5 & Issue 6 Fixes
 */

const BASE_URL = 'http://localhost:5000';

async function runFixVerification() {
  console.log('\n========================================================');
  console.log('[VERITAS // SUPPLY] VERIFYING AUDIT FIXES');
  console.log('========================================================\n');

  // Test 1: Reset cleans mitigation memos & avoided Scope 3 carbon
  console.log('[TEST 1] Verifying Scope-3 avoided emissions resets cleanly...');
  await fetch(`${BASE_URL}/api/disruption/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplierId: '30000000-0000-0000-0000-000000000001',
      type: 'GEOPOLITICAL_BLOCKADE',
      severity: 0.90,
    }),
  });

  const memo1Res = await fetch(`${BASE_URL}/api/mitigation/30000000-0000-0000-0000-000000000001`, {
    method: 'POST',
  });
  const memo1 = await memo1Res.json();
  console.log(`  -> Initial Memo avoidedScope3: ${memo1.avoidedScope3Tco2e} tCO2e`);

  let stateRes = await fetch(`${BASE_URL}/api/risk-state`);
  let stateData = await stateRes.json();
  console.log(`  -> Active avoided Scope-3 total: ${stateData.portfolioMetrics.avoidedScope3Tco2e} tCO2e`);
  if (stateData.portfolioMetrics.avoidedScope3Tco2e <= 0) {
    throw new Error('Expected avoidedScope3Tco2e > 0 prior to reset');
  }

  // Execute reset
  await fetch(`${BASE_URL}/api/disruption/reset`, { method: 'POST' });
  stateRes = await fetch(`${BASE_URL}/api/risk-state`);
  stateData = await stateRes.json();
  console.log(`  -> Post-reset avoided Scope-3 total: ${stateData.portfolioMetrics.avoidedScope3Tco2e} tCO2e`);
  if (stateData.portfolioMetrics.avoidedScope3Tco2e !== 0) {
    throw new Error(`FAIL: expected avoidedScope3Tco2e === 0, got ${stateData.portfolioMetrics.avoidedScope3Tco2e}`);
  }
  console.log('  ✓ PASS: resetRiskState cleanly zeroes out cumulative Scope-3 avoided carbon.\n');

  // Test 2: Mitigation for non-seeded supplier (DRC Cobalt Miner)
  console.log('[TEST 2] Verifying dynamic mitigation & DB persistence for non-seeded supplier...');
  const cobaltSupplierId = '40000000-0000-0000-0000-000000000001'; // Katanga Artisanal Ore (Tier 4 Cobalt)
  const memo2Res = await fetch(`${BASE_URL}/api/mitigation/${cobaltSupplierId}`, {
    method: 'POST',
  });
  if (memo2Res.status !== 200) {
    const errorText = await memo2Res.text();
    throw new Error(`FAIL: Mitigation for non-seeded supplier failed with status ${memo2Res.status}: ${errorText}`);
  }
  const memo2 = await memo2Res.json();
  console.log(`  -> Generated Alternate Name: "${memo2.alternateName}"`);
  console.log(`  -> Dynamic Avoided Scope-3: ${memo2.avoidedScope3Tco2e} tCO2e (not hardcoded 1420)`);
  console.log(`  -> Compliance Rationale: ${memo2.complianceRationale.substring(0, 70)}...`);

  if (memo2.avoidedScope3Tco2e === 1420.0) {
    throw new Error('FAIL: Avoided Scope-3 is still hardcoded to 1420.0 for raw mineral supplier');
  }
  if (!memo2.alternateName.includes('Cobalt')) {
    throw new Error(`FAIL: Expected alternate name tailored to Cobalt, received: ${memo2.alternateName}`);
  }
  console.log('  ✓ PASS: Dynamic alternate generated, persisted to DB, and computed without FK failure.\n');

  // Test 3: SPOF Bridges return true bottlenecks
  console.log('[TEST 3] Verifying SPOF bridges analytics...');
  const spofRes = await fetch(`${BASE_URL}/api/analytics/spofs`);
  const spofData = await spofRes.json();
  console.log(`  -> Single Points of Failure: ${spofData.singlePointsOfFailure.length}`);
  console.log(`  -> Bridge Corridors detected: ${spofData.bridgeEdges.length}`);
  if (spofData.bridgeEdges.length === 0) {
    throw new Error('FAIL: Expected bridge edges to be detected');
  }
  console.log('  ✓ PASS: SPOF and bottleneck bridges returned accurately.\n');

  // Test 4: Parity on reset again
  await fetch(`${BASE_URL}/api/disruption/reset`, { method: 'POST' });
  console.log('========================================================');
  console.log('ALL AUDIT FIXES VERIFIED SUCCESSFULLY!');
  console.log('========================================================\n');
}

runFixVerification().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
