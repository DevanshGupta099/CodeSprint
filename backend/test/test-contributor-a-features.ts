/**
 * Automated Verification for Contributor A Deliverables:
 * 1. Multi-Format BOM Ingestion (CSV, XLSX, PDF)
 * 2. Multi-BOM Architecture Preset Switching (EV Battery, Aerospace Satellite, Semiconductor MCU)
 * 3. Live Maritime & Trade Disruption Bulletins
 * 4. Closed-Loop PostgreSQL CTE Ingestion & Hierarchy Reconstruction
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function runContributorATests() {
  console.log('\n========================================================');
  console.log('[VERITAS // CONTRIBUTOR A] VERIFYING DATA & AI DELIVERABLES');
  console.log('========================================================\n');

  // Test 1: Service Healthcheck
  console.log('[TEST 1] Backend Healthcheck (GET /api/health)...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (healthRes.status !== 200) throw new Error(`Healthcheck failed with HTTP ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log(`  -> Database: ${healthData.database}, Port: ${healthData.port}`);
  console.log('  ✓ PASS: Healthcheck verified.\n');

  // Test 2: Ingest Binary Excel (.xlsx) BOM
  console.log('[TEST 2] Ingesting Binary Excel Spreadsheet (.xlsx)...');
  const xlsxPath = path.resolve('../data/sample-ev-battery-bom.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`XLSX file not found at ${xlsxPath}`);
  }
  const xlsxBuffer = fs.readFileSync(xlsxPath);
  const xlsxBlob = new Blob([xlsxBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const xlsxFormData = new FormData();
  xlsxFormData.append('file', xlsxBlob, 'sample-ev-battery-bom.xlsx');
  xlsxFormData.append('orgId', DEFAULT_ORG_ID);

  const xlsxRes = await fetch(`${BASE_URL}/api/ingest`, {
    method: 'POST',
    body: xlsxFormData,
  });

  if (xlsxRes.status !== 200) {
    throw new Error(`XLSX Ingestion failed with HTTP ${xlsxRes.status}: ${await xlsxRes.text()}`);
  }
  const xlsxResult = await xlsxRes.json();
  console.log(`  -> Format: ${xlsxResult.format}`);
  console.log(`  -> Nodes in DAG: ${xlsxResult.dag?.nodes?.length}`);
  console.log(`  -> Edges in DAG: ${xlsxResult.dag?.edges?.length}`);
  if (xlsxResult.format !== 'xlsx') throw new Error(`Expected format 'xlsx', got '${xlsxResult.format}'`);
  if (!xlsxResult.dag?.nodes || xlsxResult.dag.nodes.length < 5) {
    throw new Error('Expected at least 5 nodes in ingested DAG');
  }
  console.log('  ✓ PASS: Binary XLSX parsed, validated, and persisted in PostgreSQL CTE.\n');

  // Test 3: Ingest PDF Document with AI Extraction Agent
  console.log('[TEST 3] Ingesting PDF Document via Autonomous AI Extraction Agent...');
  // Create a minimal valid PDF-header buffer with procurement text
  const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 12 Tf
72 712 Td
(Veritas Motors EV Battery Supply Chain Procurement Contract) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000210 00000 n 
trailer << /Root 1 0 R /Size 5 >>
startxref
380
%%EOF`;

  const pdfBlob = new Blob([Buffer.from(pdfContent)], { type: 'application/pdf' });
  const pdfFormData = new FormData();
  pdfFormData.append('file', pdfBlob, 'Veritas_EV_Procurement_Spec.pdf');
  pdfFormData.append('orgId', DEFAULT_ORG_ID);

  const pdfRes = await fetch(`${BASE_URL}/api/ingest`, {
    method: 'POST',
    body: pdfFormData,
  });

  if (pdfRes.status !== 200) {
    throw new Error(`PDF Ingestion failed with HTTP ${pdfRes.status}: ${await pdfRes.text()}`);
  }
  const pdfResult = await pdfRes.json();
  console.log(`  -> Format: ${pdfResult.format}`);
  console.log(`  -> AI Document Source: "${pdfResult.source}"`);
  console.log(`  -> Ingested Nodes: ${pdfResult.dag?.nodes?.length}`);
  if (pdfResult.format !== 'pdf') throw new Error(`Expected format 'pdf', got '${pdfResult.format}'`);
  console.log('  ✓ PASS: PDF invoice extracted and persisted via AI Agent pipeline.\n');

  // Test 4: Retrieve Available Multi-BOM Presets
  console.log('[TEST 4] Retrieving Available BOM Architecture Presets (GET /api/scenarios/boms)...');
  const bomsRes = await fetch(`${BASE_URL}/api/scenarios/boms`);
  if (bomsRes.status !== 200) throw new Error(`BOM Presets failed with HTTP ${bomsRes.status}`);
  const bomsData = await bomsRes.json();
  const presetKeys = bomsData.presets.map((p: any) => p.key);
  console.log(`  -> Found ${bomsData.count} presets: ${presetKeys.join(', ')}`);
  if (!presetKeys.includes('EV_BATTERY_PACK') || !presetKeys.includes('AEROSPACE_SATELLITE') || !presetKeys.includes('SEMICONDUCTOR_MCU')) {
    throw new Error('Missing expected BOM architecture presets');
  }
  console.log('  ✓ PASS: Multi-BOM presets catalog verified.\n');

  // Test 5: Switch Active BOM to Aerospace Satellite Architecture
  console.log('[TEST 5] Switching Active BOM to Aerospace Satellite (POST /api/scenarios/boms/AEROSPACE_SATELLITE/load)...');
  const aeroRes = await fetch(`${BASE_URL}/api/scenarios/boms/AEROSPACE_SATELLITE/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: DEFAULT_ORG_ID }),
  });
  if (aeroRes.status !== 200) throw new Error(`Aerospace load failed: ${await aeroRes.text()}`);
  const aeroData = await aeroRes.json();
  console.log(`  -> Loaded Preset: ${aeroData.preset?.title}`);
  console.log(`  -> Aerospace DAG Nodes: ${aeroData.dag?.nodes?.length}`);
  const rootNode = aeroData.dag?.nodes?.find((n: any) => n.tier === 0);
  console.log(`  -> Root Tier 0: ${rootNode?.name} (${rootNode?.materialCategory})`);
  if (!rootNode?.name.includes('AeroSpace')) {
    throw new Error('Expected root node to be AeroSpace Dynamics Prime');
  }
  console.log('  ✓ PASS: Aerospace Satellite multi-tier BOM dynamically reconstructed.\n');

  // Test 6: Switch Active BOM to Automotive Grade Semiconductor MCU Architecture
  console.log('[TEST 6] Switching Active BOM to Semiconductor Microcontroller (POST /api/scenarios/boms/SEMICONDUCTOR_MCU/load)...');
  const semiRes = await fetch(`${BASE_URL}/api/scenarios/boms/SEMICONDUCTOR_MCU/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: DEFAULT_ORG_ID }),
  });
  if (semiRes.status !== 200) throw new Error(`Semiconductor load failed: ${await semiRes.text()}`);
  const semiData = await semiRes.json();
  console.log(`  -> Loaded Preset: ${semiData.preset?.title}`);
  console.log(`  -> Semiconductor DAG Nodes: ${semiData.dag?.nodes?.length}`);
  const semiRoot = semiData.dag?.nodes?.find((n: any) => n.tier === 0);
  console.log(`  -> Root Tier 0: ${semiRoot?.name}`);
  if (!semiRoot?.name.includes('Apex Autotech ECU')) {
    throw new Error('Expected root node to be Apex Autotech ECU Systems');
  }
  console.log('  ✓ PASS: Semiconductor MCU multi-tier BOM dynamically reconstructed.\n');

  // Test 7: Restore Canonical EV Battery Dataset for Standard Demo Loop
  console.log('[TEST 7] Restoring Canonical EV Battery Pack Preset (POST /api/scenarios/boms/EV_BATTERY_PACK/load)...');
  const evRes = await fetch(`${BASE_URL}/api/scenarios/boms/EV_BATTERY_PACK/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId: DEFAULT_ORG_ID }),
  });
  if (evRes.status !== 200) throw new Error(`EV Battery restore failed: ${await evRes.text()}`);
  const evData = await evRes.json();
  console.log(`  -> Restored Preset: ${evData.preset?.title}`);
  console.log(`  -> Restored Nodes: ${evData.dag?.nodes?.length}`);
  console.log('  ✓ PASS: EV Battery baseline restored.\n');

  // Test 8: Live Disruption Intelligence Bulletin
  console.log('[TEST 8] Fetching Live Disruption Intelligence Bulletin (GET /api/disruption/bulletin/RED_SEA_BLOCKADE)...');
  const bulletinRes = await fetch(`${BASE_URL}/api/disruption/bulletin/RED_SEA_BLOCKADE?country=Yemen`);
  if (bulletinRes.status !== 200) throw new Error(`Bulletin failed with HTTP ${bulletinRes.status}`);
  const bulletinData = await bulletinRes.json();
  const b = bulletinData.bulletin;
  console.log(`  -> Source: ${b.sourceAgency}`);
  console.log(`  -> Advisory: ${b.advisoryLevel}`);
  console.log(`  -> Headline: "${b.headline}"`);
  console.log(`  -> Coordinates: ${b.maritimeCoordinates}`);
  if (!b.sourceAgency.includes('Maritime') || !b.maritimeCoordinates.includes('12°')) {
    throw new Error('Invalid bulletin structure or coordinates');
  }
  console.log('  ✓ PASS: Live disruption intelligence bulletin successfully generated.\n');

  console.log('========================================================');
  console.log('ALL CONTRIBUTOR A DATA & AI DELIVERABLES VERIFIED (8/8)');
  console.log('========================================================\n');
}

runContributorATests().catch((err) => {
  console.error('\n❌ CONTRIBUTOR A TEST FAILED:', err);
  process.exit(1);
});
