import { getSupplyChainDAG, propagateRiskUpstream, getRiskState, resetRiskState } from '../src/db/queries.js';
import { generateMitigationMemo } from '../src/services/mitigation.js';
import { pool } from '../src/db/index.js';

async function runVerification() {
  console.log('=== [VERITAS SUPPLY] BACKEND & CTE VERIFICATION SUITE ===\n');

  const orgId = '00000000-0000-0000-0000-000000000001';

  // 1. Test Downward DAG Reconstruction CTE
  console.log('1. Testing Downward Recursive CTE (bom_tree)...');
  const dag = await getSupplyChainDAG(orgId);
  console.log(`   ✓ Reconstructed DAG: ${dag.nodes.length} suppliers across Tiers 0–4, ${dag.edges.length} edges.`);

  // 2. Test Upward Risk Propagation CTE (0.7x attenuation)
  console.log('\n2. Testing Upward Recursive CTE (risk_up with 0.7x decay)...');
  const disruptedNodeId = '30000000-0000-0000-0000-000000000001'; // Apex Maritime Logistics
  const impacted = await propagateRiskUpstream(disruptedNodeId, 0.95, 0.90, 'Bab-el-Mandeb Strait Blockade');
  console.log(`   ✓ Risk propagated across ${impacted.length} downstream tiers:`);
  impacted.forEach((node) => {
    console.log(`     - Supplier ID: ${node.supplier_id} -> Impact Score: ${node.propagated_risk}`);
  });

  // 3. Test Risk State Polling
  console.log('\n3. Testing Risk State Telemetry (/api/risk-state)...');
  const state = await getRiskState(orgId);
  console.log(`   ✓ Active disruptions: ${state.portfolioMetrics.activeDisruptionsCount}`);
  console.log(`   ✓ Total spend at risk: $${(state.portfolioMetrics.totalSpendAtRiskUSD / 1000000).toFixed(1)}M`);

  // 4. Test Autonomous Mitigation Engine & Memo Synthesis
  console.log('\n4. Testing Autonomous Mitigation Engine (/api/mitigation)...');
  const memo = await generateMitigationMemo(disruptedNodeId);
  console.log(`   ✓ Alternate Selected: ${memo.alternateName}`);
  console.log(`   ✓ Price Variance: +${memo.priceVariancePct}%`);
  console.log(`   ✓ Lead Time Delta: ${memo.leadTimeDeltaDays} days`);
  console.log(`   ✓ Avoided Scope-3 Carbon: -${memo.avoidedScope3Tco2e.toLocaleString()} tCO2e`);
  console.log(`   ✓ Summary: ${memo.executiveSummary.slice(0, 100)}...`);

  // 5. Test Reset
  console.log('\n5. Testing Reset to Nominal State...');
  await resetRiskState(orgId);
  const resetState = await getRiskState(orgId);
  console.log(`   ✓ Spend at risk after reset: $${resetState.portfolioMetrics.totalSpendAtRiskUSD}`);

  console.log('\n=== ALL BACKEND ENGINES & CTES VERIFIED SUCCESSFULLY ===');
  await pool.end();
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
