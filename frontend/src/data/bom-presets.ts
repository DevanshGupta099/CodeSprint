import { SupplyChainDAGResponse } from '../types/supply-chain';
import { INITIAL_DAG_DATA } from './seed-graph';

export interface BOMPresetInfo {
  key: string;
  badge: string;
  title: string;
  shortTitle: string;
  industry: string;
  description: string;
  nodeCount: number;
  primaryChokepoint: string;
  primaryChokepointSupplierId: string;
  defaultSpendUSD: string;
}

export const BOM_PRESETS_CATALOG: Record<string, BOMPresetInfo> = {
  EV_BATTERY_PACK: {
    key: 'EV_BATTERY_PACK',
    badge: 'EV_BATTERY_PACK_V4',
    title: 'Flagship 800V EV Battery Pack & Powertrain',
    shortTitle: 'EV Battery Pack (800V)',
    industry: 'Automotive & Clean Mobility (SDG 12)',
    description: '11 Tier-0 to Tier-4 nodes spanning Chile lithium, DRC cobalt, German battery modules, and Bab-el-Mandeb chokepoint.',
    nodeCount: 11,
    primaryChokepoint: 'Apex Maritime Logistics (Bab-el-Mandeb Strait // SPOF)',
    primaryChokepointSupplierId: '10000000-0000-0000-0000-000000000007',
    defaultSpendUSD: '$41,540,000',
  },
  AEROSPACE_SATELLITE: {
    key: 'AEROSPACE_SATELLITE',
    badge: 'AEROSPACE_SATELLITE_V2',
    title: 'LEO Constellation Satellite Bus & Hall Thrusters',
    shortTitle: 'Aerospace Satellite Bus',
    industry: 'Aerospace & Defense Telemetry',
    description: '12 Tier-0 to Tier-4 nodes spanning French electric propulsion, German space solar arrays, and Malacca Strait shipping.',
    nodeCount: 12,
    primaryChokepoint: 'Strait Maritime Heavy Freight (Strait of Malacca // SPOF)',
    primaryChokepointSupplierId: 'aerospace-node-smh-sgp',
    defaultSpendUSD: '$36,800,000',
  },
  SEMICONDUCTOR_MCU: {
    key: 'SEMICONDUCTOR_MCU',
    badge: 'SEMICONDUCTOR_MCU_V3',
    title: 'Automotive Grade-0 Microcontroller & Photolithography',
    shortTitle: 'Automotive MCU 28nm',
    industry: 'Advanced Semiconductors & Electronics',
    description: '11 Tier-0 to Tier-4 nodes spanning Taiwanese 28nm foundries, Ukrainian laser neon gas refiners, and Xinjiang silicon.',
    nodeCount: 11,
    primaryChokepoint: 'Odesa Noble Gas Refiners (Black Sea Corridor // SPOF)',
    primaryChokepointSupplierId: 'semi-node-onr-ukr',
    defaultSpendUSD: '$48,200,000',
  },
};

export const BOM_PRESET_DAGS: Record<string, SupplyChainDAGResponse> = {
  EV_BATTERY_PACK: INITIAL_DAG_DATA,
};
