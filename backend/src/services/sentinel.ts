import { query } from '../db/index.js';
import { propagateRiskUpstream } from '../db/queries.js';

export interface TriggerDisruptionParams {
  supplierId?: string;
  type?: 'GEOPOLITICAL_BLOCKADE' | 'NATURAL_DISASTER' | 'SANCTIONS_FORCED_LABOR' | 'PORT_CLOSURE';
  severity?: number;
  sourceSummary?: string;
  sourceUrl?: string;
}

export async function triggerDisruptionSentinel(params: TriggerDisruptionParams) {
  // Default to the showstopper: Apex Maritime Logistics (Bab-el-Mandeb chokepoint)
  const targetSupplierId = params.supplierId || '30000000-0000-0000-0000-000000000001';
  const eventType = params.type || 'GEOPOLITICAL_BLOCKADE';
  const severity = params.severity !== undefined ? params.severity : 0.90;
  const probability = 0.95;
  const sourceSummary = params.sourceSummary || 
    'Bab-el-Mandeb Strait transit halt due to maritime security escalation. 42 commercial bulk carriers rerouted or held.';
  const sourceUrl = params.sourceUrl || 'https://lloydslist.maritimeintelligence.informa.com';

  // 1. Record Disruption Event
  const eventInsert = await query(
    `INSERT INTO disruption_events (supplier_id, type, severity, source_summary, source_url, triggered_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, supplier_id AS "supplierId", type, severity, source_summary AS "sourceSummary", source_url AS "sourceUrl", triggered_at AS "triggeredAt"`,
    [targetSupplierId, eventType, severity, sourceSummary, sourceUrl]
  );
  const event = eventInsert.rows[0];

  // 2. Execute Upward Recursive CTE Risk Propagation (0.7x attenuation per hop)
  const impactedNodes = await propagateRiskUpstream(
    targetSupplierId,
    probability,
    severity,
    sourceSummary
  );

  return {
    event,
    impactedNodes,
    message: `[DISRUPTION_ACTIVE] Propagated risk to ${impactedNodes.length} downstream tiers via recursive CTE.`,
  };
}
