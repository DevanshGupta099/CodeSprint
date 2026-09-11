import { DisruptionScenario } from '../types/supply-chain.js';
import { query } from '../db/index.js';
import { triggerDisruptionSentinel } from './sentinel.js';

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
