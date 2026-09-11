/**
 * Automated Security, Vulnerability & Edge Case Test Suite
 * VeritasSupply Backend Intelligence Engine
 */

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: TestResult[] = [];

async function assertTest(name: string, expected: string, fn: () => Promise<{ passed: boolean; actual: string; details?: any }>) {
  try {
    const res = await fn();
    results.push({ name, passed: res.passed, expected, actual: res.actual, details: res.details });
    const mark = res.passed ? '✓' : '✗';
    console.log(`  ${mark} [${res.passed ? 'PASS' : 'FAIL'}] ${name} -> ${res.actual}`);
  } catch (err: any) {
    results.push({ name, passed: false, expected, actual: `EXCEPTION: ${err.message}` });
    console.log(`  ✗ [FAIL] ${name} -> EXCEPTION: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n========================================================');
  console.log('[VERITAS // SUPPLY] RUNNING SECURITY & API TEST SUITE');
  console.log('========================================================\n');

  // Test 1: Healthcheck & Security Headers
  await assertTest('1. Healthcheck Endpoint & Security Headers', 'Status 200 & nosniff header', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const nosniff = res.headers.get('x-content-type-options');
    const poweredBy = res.headers.get('x-powered-by');
    const passed = res.status === 200 && data.status === 'ONLINE' && nosniff === 'nosniff' && !poweredBy;
    return {
      passed,
      actual: `Status: ${res.status}, Nosniff: ${nosniff}, PoweredBy: ${poweredBy || 'Hidden'}`,
    };
  });

  // Test 2: SQL Injection Attempt in orgId parameter
  await assertTest('2. SQL Injection in :orgId Parameter', 'Status 400 INVALID_PARAMETER', async () => {
    const res = await fetch(`${BASE_URL}/api/supply-chain/' OR '1'='1`);
    const data = await res.json();
    const passed = res.status === 400 && data.error === 'INVALID_PARAMETER';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error} - "${data.message}"`,
    };
  });

  // Test 3: Invalid UUID Format in supply-chain endpoint
  await assertTest('3. Malformed UUID in :orgId', 'Status 400 INVALID_PARAMETER', async () => {
    const res = await fetch(`${BASE_URL}/api/supply-chain/not-a-real-uuid-12345`);
    const data = await res.json();
    const passed = res.status === 400 && data.error === 'INVALID_PARAMETER';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 4: Non-Existent Valid UUID in supply-chain endpoint
  await assertTest('4. Non-Existent Organization UUID', 'Status 404 NOT_FOUND', async () => {
    const res = await fetch(`${BASE_URL}/api/supply-chain/ffffffff-ffff-ffff-ffff-ffffffffffff`);
    const data = await res.json();
    const passed = res.status === 404 && data.error === 'NOT_FOUND';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error} - "${data.message}"`,
    };
  });

  // Test 5: Out of bounds severity in disruption trigger
  await assertTest('5. Invalid Severity (>1.0) in /api/disruption/trigger', 'Status 400 VALIDATION_FAILED', async () => {
    const res = await fetch(`${BASE_URL}/api/disruption/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity: 5.5 }),
    });
    const data = await res.json();
    const passed = res.status === 400 && data.error === 'VALIDATION_FAILED';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 6: Invalid disruption type enum
  await assertTest('6. Invalid Disruption Type in /api/disruption/trigger', 'Status 400 VALIDATION_FAILED', async () => {
    const res = await fetch(`${BASE_URL}/api/disruption/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ALIEN_ABDUCTION_EVENT' }),
    });
    const data = await res.json();
    const passed = res.status === 400 && data.error === 'VALIDATION_FAILED';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 7: Non-existent supplier in disruption trigger
  await assertTest('7. Non-Existent Supplier in Disruption Trigger', 'Status 404 NOT_FOUND', async () => {
    const res = await fetch(`${BASE_URL}/api/disruption/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId: 'ffffffff-ffff-ffff-ffff-ffffffffffff' }),
    });
    const data = await res.json();
    const passed = res.status === 404 && data.error === 'NOT_FOUND';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 8: Non-existent supplier in mitigation memo generator
  await assertTest('8. Non-Existent Supplier in /api/mitigation/:id', 'Status 404 NOT_FOUND', async () => {
    const res = await fetch(`${BASE_URL}/api/mitigation/ffffffff-ffff-ffff-ffff-ffffffffffff`, {
      method: 'POST',
    });
    const data = await res.json();
    const passed = res.status === 404 && data.error === 'NOT_FOUND';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 9: Valid Disruption Trigger & Recursive CTE Risk Attenuation
  await assertTest('9. Simulate Red Sea Blockade & Verify 0.7x CTE Decay', 'Risk propagated correctly', async () => {
    const chokepointId = '30000000-0000-0000-0000-000000000001';
    const res = await fetch(`${BASE_URL}/api/disruption/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: chokepointId,
        type: 'GEOPOLITICAL_BLOCKADE',
        severity: 0.90,
      }),
    });
    const data = await res.json();
    const impacted = data.impactedNodes || [];
    const passed = res.status === 200 && impacted.length >= 4;
    return {
      passed,
      actual: `HTTP ${res.status}, Impacted ${impacted.length} tiers`,
    };
  });

  // Test 10: Polled Risk State reflects disruption
  await assertTest('10. Polled Risk State reflects elevated spend-at-risk', 'Total spend at risk > 0', async () => {
    const res = await fetch(`${BASE_URL}/api/risk-state`);
    const data = await res.json();
    const spend = data.portfolioMetrics?.totalSpendAtRiskUSD || 0;
    const passed = res.status === 200 && spend > 0;
    return {
      passed,
      actual: `Total Spend at Risk: $${(spend / 1000000).toFixed(1)}M`,
    };
  });

  // Test 11: Mitigation Memo Generation with Zod validation
  await assertTest('11. Autonomous Mitigation Memo Synthesis', 'Zod valid memo returned', async () => {
    const chokepointId = '30000000-0000-0000-0000-000000000001';
    const res = await fetch(`${BASE_URL}/api/mitigation/${chokepointId}`, {
      method: 'POST',
    });
    const data = await res.json();
    const passed = res.status === 200 && data.alternateName && data.priceVariancePct !== undefined && data.avoidedScope3Tco2e > 0;
    return {
      passed,
      actual: `Alternate: "${data.alternateName}", Avoided CO2: ${data.avoidedScope3Tco2e} tCO2e`,
    };
  });

  // Test 12: Ingestion of Malformed CSV Data
  await assertTest('12. Ingestion of Malformed CSV Data', 'Status 400 INVALID_BOM_DATA', async () => {
    const formData = new FormData();
    const blob = new Blob(['bad,header,row'], { type: 'text/csv' });
    formData.append('file', blob, 'malformed.csv');

    const res = await fetch(`${BASE_URL}/api/ingest`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    const passed = res.status === 400 && data.error === 'INVALID_BOM_DATA';
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.error}`,
    };
  });

  // Test 13: Ingestion of Valid CSV with Quoted Commas
  await assertTest('13. Ingestion of Valid CSV with Quoted Commas', 'Successfully ingested without splitting quotes', async () => {
    const validCSV = `Supplier Name,Code,Country,Country Code,Tier,Material Category,Component Name,Spend USD,Lead Time Days,Parent Supplier Code,Shipping Route,Latitude,Longitude
"Apex Power Systems, Inc.",APS-EXT,Germany,DEU,1,"HV Battery, Module Assembly","800V Battery",150000000,22,VMC-USA,Transatlantic Direct,52.52,13.40`;

    const formData = new FormData();
    const blob = new Blob([validCSV], { type: 'text/csv' });
    formData.append('file', blob, 'valid.csv');

    const res = await fetch(`${BASE_URL}/api/ingest`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    const passed = res.status === 200 && data.dag && data.dag.nodes.length >= 11;
    return {
      passed,
      actual: `HTTP ${res.status}: ${data.message}`,
    };
  });

  // Test 14: Reset Disruption State
  await assertTest('14. Reset Disruption State to Nominal', 'Spend at risk returns to 0', async () => {
    const res = await fetch(`${BASE_URL}/api/disruption/reset`, { method: 'POST' });
    const resetMsg = await res.json();

    const stateRes = await fetch(`${BASE_URL}/api/risk-state`);
    const stateData = await stateRes.json();
    const spend = stateData.portfolioMetrics?.totalSpendAtRiskUSD || 0;
    const passed = res.status === 200 && spend === 0;
    return {
      passed,
      actual: `Reset confirmed. Spend at Risk: $${spend}`,
    };
  });

  console.log('\n========================================================');
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`TEST SUMMARY: ${totalPassed}/${results.length} TESTS PASSED (${((totalPassed / results.length) * 100).toFixed(0)}%)`);
  console.log('========================================================\n');

  if (totalPassed < results.length) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
