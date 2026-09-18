import { z } from 'zod';
import { query } from '../db/index.js';
import { propagateRiskUpstream } from '../db/queries.js';
import { DisruptionTypeSchema } from '../types/supply-chain.js';

export const TriggerDisruptionRequestSchema = z.object({
  supplierId: z.string().min(1).max(100).optional(),
  type: DisruptionTypeSchema.optional().default('GEOPOLITICAL_BLOCKADE'),
  severity: z.number().min(0).max(1).optional().default(0.90),
  sourceSummary: z.string().max(1000).optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
});

export type TriggerDisruptionParams = z.infer<typeof TriggerDisruptionRequestSchema>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function triggerDisruptionSentinel(params: TriggerDisruptionParams) {
  let rawSupplierId = params.supplierId || '30000000-0000-0000-0000-000000000001';
  const eventType = params.type || 'GEOPOLITICAL_BLOCKADE';
  const severity = params.severity !== undefined ? params.severity : 0.90;
  const probability = 0.95;
  const sourceSummary = params.sourceSummary || 
    'Bab-el-Mandeb Strait transit halt due to maritime security escalation. 42 commercial bulk carriers rerouted or held.';
  const sourceUrl = params.sourceUrl || 'https://lloydslist.maritimeintelligence.informa.com';

  // Resilient target supplier lookup: UUID -> code/name -> SPOF node -> Tier 3 node -> any node
  let targetSupplier: any = null;

  if (UUID_REGEX.test(rawSupplierId)) {
    const supplierCheck = await query('SELECT id, name, country, tier FROM suppliers WHERE id = $1', [rawSupplierId]);
    if (supplierCheck.rows.length > 0) {
      targetSupplier = supplierCheck.rows[0];
    }
  }

  if (!targetSupplier) {
    const codeCheck = await query(
      'SELECT id, name, country, tier FROM suppliers WHERE code = $1 OR name ILIKE $1 LIMIT 1',
      [rawSupplierId]
    );
    if (codeCheck.rows.length > 0) {
      targetSupplier = codeCheck.rows[0];
    }
  }

  if (!targetSupplier) {
    const spofCheck = await query(
      'SELECT id, name, country, tier FROM suppliers WHERE is_spof = TRUE OR tier = 3 ORDER BY tier DESC LIMIT 1'
    );
    if (spofCheck.rows.length > 0) {
      targetSupplier = spofCheck.rows[0];
    } else {
      const anyCheck = await query('SELECT id, name, country, tier FROM suppliers LIMIT 1');
      if (anyCheck.rows.length > 0) targetSupplier = anyCheck.rows[0];
    }
  }

  if (!targetSupplier) {
    throw new Error('No suppliers found in active database to disrupt');
  }

  const targetSupplierId = targetSupplier.id;

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
    targetSupplier: {
      id: targetSupplier.id,
      name: targetSupplier.name,
      country: targetSupplier.country,
      tier: targetSupplier.tier,
    },
    impactedNodes,
    message: `[DISRUPTION_ACTIVE] Propagated risk to ${impactedNodes.length} downstream tiers via recursive CTE.`,
  };
}
