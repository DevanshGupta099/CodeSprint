import fs from 'fs';
import path from 'path';
import { DisruptionScenario } from '../types/supply-chain.js';
import { query } from '../db/index.js';
import { triggerDisruptionSentinel } from './sentinel.js';
import { parseBOMCSV, ingestBOMItems } from './ingestion.js';

export const SCENARIO_CATALOG: Record<string, DisruptionScenario> = {
  RED_SEA_BLOCKADE: {
    key: 'RED_SEA_BLOCKADE',
    title: 'Red Sea & Bab-el-Mandeb Maritime Chokepoint Blockade',
    targetSupplierCode: 'AML-YEM',
    targetSupplierName: 'Apex Maritime Logistics',
    disruptionType: 'GEOPOLITICAL_BLOCKADE',
    severity: 0.92,
    sdgAnchor: 'SDG 8 (Decent Work & Maritime Crew Welfare) / SDG 12 (Avoided Scope-3 Emissions)',
    narrative:
      'Houthi drone swarm and missile strikes near Bab-el-Mandeb strait force indefinite container bypass via Cape of Good Hope. Apex Maritime shipments halted with cascading lead-time inflation.',
  },
  XINJIANG_UFLPA_SANCTIONS: {
    key: 'XINJIANG_UFLPA_SANCTIONS',
    title: 'Xinjiang Polysilicon Forced Labor Withhold Release Order (UFLPA)',
    targetSupplierCode: 'SRS-CHN',
    targetSupplierName: 'Sino-Refine Silicon Co',
    disruptionType: 'SANCTIONS_FORCED_LABOR',
    severity: 0.88,
    sdgAnchor: 'SDG 8: Decent Work & Total Eradication of Forced Labor',
    narrative:
      'US Customs and Border Protection (CBP) enforces immediate detention of polysilicon substrates under the Uyghur Forced Labor Prevention Act. All shipments from Sino-Refine Silicon confiscated at customs.',
  },
  DRC_COBALT_MORATORIUM: {
    key: 'DRC_COBALT_MORATORIUM',
    title: 'DRC Artisanal Cobalt Mine Moratorium & Child Labor Audit',
    targetSupplierCode: 'KAO-COD',
    targetSupplierName: 'Katanga Artisanal Ore',
    disruptionType: 'SANCTIONS_FORCED_LABOR',
    severity: 0.95,
    sdgAnchor: 'SDG 8: Elimination of Hazardous Child Labor & Modern Slavery',
    narrative:
      'Artisanal pit collapse and audit exposé in Katanga province triggers emergency export embargo on unvetted cobalt hydroxide, halting raw battery material exports across Tier-4 corridors.',
  },
  ATACAMA_WATER_CRISIS: {
    key: 'ATACAMA_WATER_CRISIS',
    title: 'Atacama Basin Water Extraction Freeze & Aquifer Depletion',
    targetSupplierCode: 'ASB-CHL',
    targetSupplierName: 'Atacama Salt Brine Ltd',
    disruptionType: 'NATURAL_DISASTER',
    severity: 0.85,
    sdgAnchor: 'SDG 12: Sustainable Consumption & Water Resource Protection',
    narrative:
      'Chilean Environmental Court orders immediate 60-day cessation of brine pumping due to critical aquifer depletion and indigenous community water rights infringement in the Salar de Atacama.',
  },
};

export function getScenarioCatalog(): DisruptionScenario[] {
  return Object.values(SCENARIO_CATALOG);
}

export async function simulateScenario(scenarioKey: string) {
  const scenario = SCENARIO_CATALOG[scenarioKey];
  if (!scenario) {
    throw new Error(
      `Scenario '${scenarioKey}' not found. Available scenarios: ${Object.keys(SCENARIO_CATALOG).join(', ')}`
    );
  }

  // Find supplier ID in database by code or name
  const res = await query(
    `SELECT id, name FROM suppliers WHERE code = $1 OR name ILIKE $2 LIMIT 1`,
    [scenario.targetSupplierCode, `%${scenario.targetSupplierName}%`]
  );

  if (res.rows.length === 0) {
    throw new Error(`Target supplier for scenario '${scenario.title}' not found in database.`);
  }

  const supplier = res.rows[0];

  return triggerDisruptionSentinel({
    supplierId: supplier.id,
    type: scenario.disruptionType,
    severity: scenario.severity,
    sourceSummary: `[SCENARIO: ${scenario.key}] ${scenario.narrative}`,
    sourceUrl: `https://veritassupply.internal/intel/scenarios/${scenario.key.toLowerCase()}`,
  });
}

/**
 * Multi-BOM Architecture Preset Catalog
 */
export interface BOMPreset {
  key: string;
  title: string;
  industry: string;
  description: string;
  fileName: string;
  nodeCount: number;
  primaryChokepoint: string;
}

export const BOM_PRESETS: Record<string, BOMPreset> = {
  EV_BATTERY_PACK: {
    key: 'EV_BATTERY_PACK',
    title: 'Flagship 800V EV Battery Pack & Powertrain',
    industry: 'Automotive & Clean Mobility (SDG 12)',
    description: '11 Tier-0 to Tier-4 nodes spanning Chile lithium, DRC cobalt, German battery modules, and Bab-el-Mandeb chokepoint.',
    fileName: 'sample-ev-battery-bom.csv',
    nodeCount: 11,
    primaryChokepoint: 'Apex Maritime Logistics (Bab-el-Mandeb Strait // SPOF)',
  },
  AEROSPACE_SATELLITE: {
    key: 'AEROSPACE_SATELLITE',
    title: 'LEO Constellation Satellite Bus & Hall Thrusters',
    industry: 'Aerospace & Defense Telemetry',
    description: '12 Tier-0 to Tier-4 nodes spanning French electric propulsion, German space solar arrays, and Malacca Strait shipping.',
    fileName: 'sample-aerospace-satellite-bom.csv',
    nodeCount: 12,
    primaryChokepoint: 'Strait Maritime Heavy Freight (Strait of Malacca // SPOF)',
  },
  SEMICONDUCTOR_MCU: {
    key: 'SEMICONDUCTOR_MCU',
    title: 'Automotive Grade-0 Microcontroller & Photolithography',
    industry: 'Advanced Semiconductors & Electronics',
    description: '11 Tier-0 to Tier-4 nodes spanning Taiwanese 28nm foundries, Ukrainian laser neon gas refiners, and Xinjiang silicon.',
    fileName: 'sample-semiconductor-microcontroller-bom.csv',
    nodeCount: 11,
    primaryChokepoint: 'Odesa Noble Gas Refiners (Black Sea Corridor // SPOF)',
  },
};

export function getAvailableBOMPresets(): BOMPreset[] {
  return Object.values(BOM_PRESETS);
}

/**
 * Loads a specified BOM Preset into the database for the given organization
 */
export async function loadBOMPreset(presetKey: string, orgId: string) {
  const preset = BOM_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`BOM Preset '${presetKey}' not found. Available presets: ${Object.keys(BOM_PRESETS).join(', ')}`);
  }

  // Locate the CSV file
  const possiblePaths = [
    path.resolve('data', preset.fileName),
    path.resolve('../data', preset.fileName),
    path.join(process.cwd(), 'data', preset.fileName),
    path.join(process.cwd(), '..', 'data', preset.fileName),
  ];

  let csvPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }

  if (!csvPath) {
    throw new Error(`Data file '${preset.fileName}' not found for preset '${presetKey}'`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { items, errors } = parseBOMCSV(csvContent);

  if (items.length === 0) {
    throw new Error(`Failed to parse items for preset '${presetKey}': ${JSON.stringify(errors)}`);
  }

  // Clean existing edges and suppliers for this org to ensure clean DAG reconstruction
  await query(
    `DELETE FROM supplier_edges WHERE parent_supplier_id IN (SELECT id FROM suppliers WHERE org_id = $1)
     OR child_supplier_id IN (SELECT id FROM suppliers WHERE org_id = $1)`,
    [orgId]
  );
  await query(`DELETE FROM disruption_events WHERE supplier_id IN (SELECT id FROM suppliers WHERE org_id = $1)`, [orgId]);
  await query(`DELETE FROM risk_scores WHERE supplier_id IN (SELECT id FROM suppliers WHERE org_id = $1)`, [orgId]);
  await query(`DELETE FROM suppliers WHERE org_id = $1`, [orgId]);

  const ingestionResult = await ingestBOMItems(orgId, items);

  return {
    preset,
    message: `Successfully activated '${preset.title}' with ${ingestionResult.ingestedSuppliersCount} suppliers and ${ingestionResult.linkedEdgesCount} edges`,
    dag: ingestionResult.dag,
  };
}
