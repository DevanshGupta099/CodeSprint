import { query } from './index.js';
import { Supplier, SupplierEdge, AlternateSupplier, MitigationMemo, RiskStateResponse } from '../types/supply-chain.js';

/**
 * Reconstructs the full supply chain DAG starting from the organization
 */
export async function getSupplyChainDAG(orgId: string) {
  const orgResult = await query(
    'SELECT id, name, industry FROM organizations WHERE id = $1',
    [orgId]
  );

  if (orgResult.rows.length === 0) {
    throw new Error(`Organization ${orgId} not found`);
  }

  const organization = orgResult.rows[0];

  // 1. Fetch all suppliers for this organization
  const suppliersResult = await query(
    `SELECT 
      id, org_id AS "orgId", name, code, country, country_code AS "countryCode",
      tier, material_category AS "materialCategory", certifications,
      lat, lng, CAST(spend AS FLOAT) AS spend, lead_time_days AS "leadTimeDays",
      status, risk_score AS "riskScore", is_spof AS "isSPOF"
    FROM suppliers 
    WHERE org_id = $1 
    ORDER BY tier ASC, name ASC`,
    [orgId]
  );

  const nodes: Supplier[] = suppliersResult.rows;

  // 2. Fetch all edges connecting these suppliers
  const edgesResult = await query(
    `SELECT 
      e.id, 
      e.parent_supplier_id AS "parentSupplierId",
      e.child_supplier_id AS "childSupplierId",
      e.component_name AS "componentName",
      CAST(e.spend_usd AS FLOAT) AS "spendUsd",
      e.lead_time_days AS "leadTimeDays",
      e.shipping_route AS "shippingRoute"
    FROM supplier_edges e
    JOIN suppliers p ON p.id = e.parent_supplier_id
    WHERE p.org_id = $1`,
    [orgId]
  );

  const edges: SupplierEdge[] = edgesResult.rows;

  return {
    organization,
    nodes,
    edges,
  };
}

/**
 * Executes the Upward Recursive CTE to propagate disruption risk with 0.7x decay
 */
export async function propagateRiskUpstream(
  disruptedSupplierId: string,
  probability: number,
  severity: number,
  rationale: string = 'Geopolitical blockade simulation active.'
) {
  // 1. Run the Upward Recursive CTE
  const cteQuery = `
    WITH RECURSIVE risk_up AS (
      -- Anchor: the directly disrupted supplier
      SELECT 
        $1::uuid AS supplier_id, 
        $2::float AS probability, 
        $3::float AS severity, 
        1.0::float AS decay,
        ($2::float * $3::float)::float AS current_impact,
        ARRAY[$1::uuid] AS path
      
      UNION ALL
      
      -- Recurse upward: from child (upstream) to parent (downstream consumer)
      SELECT 
        e.parent_supplier_id AS supplier_id,
        r.probability,
        r.severity,
        (r.decay * 0.7)::float AS decay,
        (r.probability * r.severity * (r.decay * 0.7))::float AS current_impact,
        r.path || e.parent_supplier_id AS path
      FROM supplier_edges e
      JOIN risk_up r ON r.supplier_id = e.child_supplier_id
      WHERE NOT (e.parent_supplier_id = ANY(r.path))
        AND r.decay > 0.01
    )
    SELECT 
      supplier_id, 
      ROUND(MAX(current_impact)::numeric, 4)::float AS propagated_risk
    FROM risk_up 
    GROUP BY supplier_id;
  `;

  const cteResult = await query(cteQuery, [disruptedSupplierId, probability, severity]);
  const impactedNodes: { supplier_id: string; propagated_risk: number }[] = cteResult.rows;

  // 2. Update status and risk_score for each impacted node in the database
  for (const node of impactedNodes) {
    const risk = node.propagated_risk;
    let status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' = 'NOMINAL';
    if (risk >= 0.70) {
      status = 'CRITICAL';
    } else if (risk >= 0.35) {
      status = 'ELEVATED';
    }

    await query(
      `UPDATE suppliers 
       SET risk_score = $1, status = $2 
       WHERE id = $3`,
      [risk, status, node.supplier_id]
    );

    // Record / upsert into risk_scores table
    await query(
      `INSERT INTO risk_scores (supplier_id, probability, severity, confidence, rationale, computed_at)
       VALUES ($1, $2, $3, 0.95, $4, NOW())`,
      [
        node.supplier_id,
        probability,
        node.supplier_id === disruptedSupplierId ? severity : risk,
        node.supplier_id === disruptedSupplierId 
          ? rationale 
          : `Propagated upstream risk attenuated through supply chain DAG (score: ${risk}).`
      ]
    );
  }

  return impactedNodes;
}

/**
 * Resets all suppliers in an organization to nominal state and clears active disruption records
 */
export async function resetRiskState(orgId: string) {
  await query(
    `UPDATE suppliers 
     SET risk_score = 0.05, status = 'NOMINAL' 
     WHERE org_id = $1`,
    [orgId]
  );

  await query(
    `DELETE FROM disruption_events 
     WHERE supplier_id IN (SELECT id FROM suppliers WHERE org_id = $1)`,
    [orgId]
  );
}

/**
 * Returns current risk state, node statuses, and portfolio metrics for polling
 */
export async function getRiskState(orgId: string): Promise<RiskStateResponse> {
  const nodesResult = await query(
    `SELECT 
      id AS "supplierId", 
      status, 
      risk_score AS "riskScore", 
      is_spof AS "isSPOF",
      spend
    FROM suppliers 
    WHERE org_id = $1`,
    [orgId]
  );

  let totalSpendAtRiskUSD = 0;
  for (const row of nodesResult.rows) {
    if (row.status === 'CRITICAL' || row.status === 'ELEVATED') {
      totalSpendAtRiskUSD += (row.spend || 0) * 1000000;
    }
  }

  const memoResult = await query(
    `SELECT COALESCE(SUM(m.avoided_scope3_tco2e), 0)::float AS total_avoided_co2 
     FROM mitigation_memos m
     JOIN suppliers s ON s.id = m.disrupted_supplier_id
     WHERE s.org_id = $1`,
    [orgId]
  );
  const avoidedScope3Tco2e = memoResult.rows[0]?.total_avoided_co2 || 0;

  const disruptionCountResult = await query(
    `SELECT COUNT(*)::int AS count 
     FROM disruption_events d
     JOIN suppliers s ON s.id = d.supplier_id
     WHERE s.org_id = $1`,
    [orgId]
  );
  const activeDisruptionsCount = disruptionCountResult.rows[0]?.count || 0;

  return {
    orgId,
    timestamp: new Date().toISOString(),
    nodes: nodesResult.rows.map((r) => ({
      supplierId: r.supplierId,
      status: r.status,
      riskScore: r.riskScore,
      isSPOF: r.isSPOF,
    })),
    portfolioMetrics: {
      totalSpendAtRiskUSD,
      avoidedScope3Tco2e,
      activeDisruptionsCount,
    },
  };
}

/**
 * Retrieves candidate alternate suppliers for a given node
 */
export async function getAlternatesForSupplier(supplierId: string): Promise<AlternateSupplier[]> {
  const res = await query(
    `SELECT 
      id, 
      replaces_supplier_id AS "replacesSupplierId", 
      name, 
      country, 
      country_code AS "countryCode",
      price_index AS "priceIndex",
      lead_time_days AS "leadTimeDays",
      emissions_factor AS "emissionsFactor",
      certifications
    FROM alternate_suppliers 
    WHERE replaces_supplier_id = $1`,
    [supplierId]
  );

  return res.rows;
}

/**
 * Saves a generated Procurement Switch Memo
 */
export async function saveMitigationMemo(memo: Omit<MitigationMemo, 'id' | 'generatedAt'>): Promise<MitigationMemo> {
  const res = await query(
    `INSERT INTO mitigation_memos (
      disrupted_supplier_id, alternate_supplier_id, alternate_name,
      price_variance_pct, lead_time_delta_days, avoided_scope3_tco2e,
      compliance_rationale, summary, generated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING 
      id, 
      disrupted_supplier_id AS "disruptedSupplierId", 
      alternate_supplier_id AS "alternateSupplierId",
      alternate_name AS "alternateName",
      price_variance_pct AS "priceVariancePct",
      lead_time_delta_days AS "leadTimeDeltaDays",
      avoided_scope3_tco2e AS "avoidedScope3Tco2e",
      compliance_rationale AS "complianceRationale",
      summary AS "executiveSummary",
      generated_at AS "generatedAt"`,
    [
      memo.disruptedSupplierId,
      memo.alternateSupplierId,
      memo.alternateName,
      memo.priceVariancePct,
      memo.leadTimeDeltaDays,
      memo.avoidedScope3Tco2e,
      memo.complianceRationale,
      memo.executiveSummary,
    ]
  );

  const row = res.rows[0];
  return {
    ...row,
    generatedAt: row.generatedAt instanceof Date ? row.generatedAt.toISOString() : new Date(row.generatedAt).toISOString(),
  };
}

/**
 * Retrieves Single Points of Failure (SPOFs) and critical bridge corridors
 */
export async function getSPOFAnalytics(orgId: string) {
  const spofResult = await query(
    `SELECT 
      id AS "supplierId", 
      name, 
      tier, 
      country, 
      material_category AS "materialCategory",
      'ARTICULATION_POINT_SPOF' AS "hazardType",
      CONCAT('Single Point of Failure: Removal of ', name, ' disconnects upstream tiers from downstream manufacturing.') AS "rationale"
    FROM suppliers 
    WHERE org_id = $1 AND is_spof = TRUE AND tier > 0
    ORDER BY tier ASC, name ASC`,
    [orgId]
  );

  const bridgeResult = await query(
    `SELECT 
      e.child_supplier_id AS "childSupplierId",
      c.name AS "childName",
      e.parent_supplier_id AS "parentSupplierId",
      p.name AS "parentName",
      e.component_name AS "component",
      'Single transit corridor: no alternate pathway exists between these nodes.' AS "rationale"
    FROM supplier_edges e
    JOIN suppliers p ON p.id = e.parent_supplier_id
    JOIN suppliers c ON c.id = e.child_supplier_id
    WHERE p.org_id = $1
    ORDER BY p.tier ASC, e.spend_usd DESC`,
    [orgId]
  );

  return {
    orgId,
    singlePointsOfFailure: spofResult.rows,
    bridgeEdges: bridgeResult.rows,
  };
}

