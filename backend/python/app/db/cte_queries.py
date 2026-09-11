from datetime import datetime, timezone
from typing import List, Dict, Any
from .connection import get_db_cursor
from ..models.schemas import (
    Supplier, SupplierEdge, Organization, SupplyChainDAGResponse,
    RiskStateResponse, RiskNodeTelemetry, PortfolioMetrics,
    AlternateSupplier, MitigationMemo, SupplierStatus,
    RerouteExecutionResponse, PortfolioBreakdownResponse,
    CountrySpendBreakdown, TierSpendBreakdown, ESGComplianceMetrics
)


def get_supply_chain_dag(org_id: str) -> SupplyChainDAGResponse:
    with get_db_cursor() as cur:
        # 1. Organization
        cur.execute("SELECT id, name, industry FROM organizations WHERE id = %s", (org_id,))
        org_row = cur.fetchone()
        if not org_row:
            raise ValueError(f"Organization '{org_id}' not found")

        organization = Organization(
            id=str(org_row[0]),
            name=org_row[1],
            industry=org_row[2]
        )

        # 2. Suppliers
        cur.execute("""
            SELECT 
                id, org_id, name, code, country, country_code,
                tier, material_category, certifications,
                lat, lng, CAST(spend AS FLOAT), lead_time_days,
                status, risk_score, is_spof
            FROM suppliers 
            WHERE org_id = %s 
            ORDER BY tier ASC, name ASC
        """, (org_id,))
        nodes: List[Supplier] = []
        for row in cur.fetchall():
            nodes.append(Supplier(
                id=str(row[0]),
                orgId=str(row[1]),
                name=row[2],
                code=row[3],
                country=row[4],
                countryCode=row[5],
                tier=row[6],
                materialCategory=row[7],
                certifications=row[8] or [],
                lat=row[9],
                lng=row[10],
                spend=row[11] or 0.0,
                leadTimeDays=row[12] or 0,
                status=SupplierStatus(row[13]),
                riskScore=row[14] or 0.0,
                isSPOF=bool(row[15])
            ))

        # 3. Edges
        cur.execute("""
            SELECT 
                e.id, 
                e.parent_supplier_id,
                e.child_supplier_id,
                e.component_name,
                CAST(e.spend_usd AS FLOAT),
                e.lead_time_days,
                e.shipping_route
            FROM supplier_edges e
            JOIN suppliers p ON p.id = e.parent_supplier_id
            WHERE p.org_id = %s
        """, (org_id,))
        edges: List[SupplierEdge] = []
        for row in cur.fetchall():
            edges.append(SupplierEdge(
                id=str(row[0]),
                parentSupplierId=str(row[1]),
                childSupplierId=str(row[2]),
                componentName=row[3],
                spendUsd=row[4] or 0.0,
                leadTimeDays=row[5] or 0,
                shippingRoute=row[6]
            ))

        return SupplyChainDAGResponse(
            organization=organization,
            nodes=nodes,
            edges=edges
        )


def propagate_risk_upstream(
    disrupted_supplier_id: str,
    probability: float,
    severity: float,
    rationale: str = "Geopolitical blockade simulation active."
) -> List[Dict[str, Any]]:
    cte_query = """
        WITH RECURSIVE risk_up AS (
            SELECT 
                %s::uuid AS supplier_id, 
                %s::float AS probability, 
                %s::float AS severity, 
                1.0::float AS decay,
                (%s::float * %s::float)::float AS current_impact,
                ARRAY[%s::uuid] AS path
            
            UNION ALL
            
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
    """
    with get_db_cursor(commit=True) as cur:
        cur.execute(cte_query, (
            disrupted_supplier_id, probability, severity, probability, severity, disrupted_supplier_id
        ))
        rows = cur.fetchall()
        impacted_nodes = [{"supplier_id": str(r[0]), "propagated_risk": float(r[1])} for r in rows]

        for node in impacted_nodes:
            risk = node["propagated_risk"]
            status = "CRITICAL" if risk >= 0.70 else "ELEVATED" if risk >= 0.35 else "NOMINAL"
            cur.execute("""
                UPDATE suppliers 
                SET risk_score = %s, status = %s 
                WHERE id = %s
            """, (risk, status, node["supplier_id"]))

            cur.execute("""
                DELETE FROM risk_scores WHERE supplier_id = %s
            """, (node["supplier_id"],))

            cur.execute("""
                INSERT INTO risk_scores (supplier_id, probability, severity, confidence, rationale, computed_at)
                VALUES (%s, %s, %s, 0.95, %s, NOW())
            """, (
                node["supplier_id"],
                probability,
                severity if node["supplier_id"] == disrupted_supplier_id else risk,
                rationale if node["supplier_id"] == disrupted_supplier_id else f"Propagated upstream risk (score: {risk})."
            ))

        return impacted_nodes


def get_risk_state(org_id: str) -> RiskStateResponse:
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, status, risk_score, is_spof, spend 
            FROM suppliers 
            WHERE org_id = %s
        """, (org_id,))
        nodes_telemetry = []
        total_spend_at_risk = 0.0

        for row in cur.fetchall():
            s_id, status, risk_score, is_spof, spend = str(row[0]), row[1], float(row[2] or 0.0), bool(row[3]), float(row[4] or 0.0)
            if status in ("CRITICAL", "ELEVATED"):
                total_spend_at_risk += spend * 1_000_000

            nodes_telemetry.append(RiskNodeTelemetry(
                supplierId=s_id,
                status=SupplierStatus(status),
                riskScore=risk_score,
                isSPOF=is_spof
            ))

        cur.execute("""
            SELECT COALESCE(SUM(m.avoided_scope3_tco2e), 0) 
            FROM mitigation_memos m
            JOIN suppliers s ON s.id = m.disrupted_supplier_id
            WHERE s.org_id = %s
        """, (org_id,))
        avoided_co2 = float(cur.fetchone()[0])

        cur.execute("""
            SELECT COUNT(*) 
            FROM disruption_events d
            JOIN suppliers s ON s.id = d.supplier_id
            WHERE s.org_id = %s
        """, (org_id,))
        active_disruptions = int(cur.fetchone()[0])

        return RiskStateResponse(
            orgId=org_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            nodes=nodes_telemetry,
            portfolioMetrics=PortfolioMetrics(
                totalSpendAtRiskUSD=total_spend_at_risk,
                avoidedScope3Tco2e=avoided_co2,
                activeDisruptionsCount=active_disruptions
            )
        )


def reset_risk_state(org_id: str):
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            UPDATE suppliers 
            SET risk_score = 0.05, status = 'NOMINAL' 
            WHERE org_id = %s
        """, (org_id,))

        cur.execute("""
            DELETE FROM disruption_events 
            WHERE supplier_id IN (SELECT id FROM suppliers WHERE org_id = %s)
        """, (org_id,))

        cur.execute("""
            DELETE FROM mitigation_memos 
            WHERE disrupted_supplier_id IN (SELECT id FROM suppliers WHERE org_id = %s)
        """, (org_id,))

        cur.execute("""
            DELETE FROM risk_scores 
            WHERE supplier_id IN (SELECT id FROM suppliers WHERE org_id = %s)
        """, (org_id,))


def get_alternates_for_supplier(supplier_id: str) -> List[AlternateSupplier]:
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT 
                id, replaces_supplier_id, name, country, country_code,
                price_index, lead_time_days, emissions_factor, certifications
            FROM alternate_suppliers 
            WHERE replaces_supplier_id = %s
        """, (supplier_id,))
        return [
            AlternateSupplier(
                id=str(r[0]),
                replacesSupplierId=str(r[1]),
                name=r[2],
                country=r[3],
                countryCode=r[4],
                priceIndex=float(r[5]),
                leadTimeDays=int(r[6]),
                emissionsFactor=float(r[7]),
                certifications=r[8] or []
            )
            for r in cur.fetchall()
        ]


def save_mitigation_memo(memo_data: dict) -> MitigationMemo:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO mitigation_memos (
                disrupted_supplier_id, alternate_supplier_id, alternate_name,
                price_variance_pct, lead_time_delta_days, avoided_scope3_tco2e,
                compliance_rationale, summary, generated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            RETURNING 
                id, disrupted_supplier_id, alternate_supplier_id, alternate_name,
                price_variance_pct, lead_time_delta_days, avoided_scope3_tco2e,
                compliance_rationale, summary, generated_at
        """, (
            memo_data["disruptedSupplierId"],
            memo_data["alternateSupplierId"],
            memo_data["alternateName"],
            memo_data["priceVariancePct"],
            memo_data["leadTimeDeltaDays"],
            memo_data["avoidedScope3Tco2e"],
            memo_data["complianceRationale"],
            memo_data["executiveSummary"]
        ))
        r = cur.fetchone()
        return MitigationMemo(
            id=str(r[0]),
            disruptedSupplierId=str(r[1]),
            alternateSupplierId=str(r[2]),
            alternateName=r[3],
            priceVariancePct=float(r[4]),
            leadTimeDeltaDays=int(r[5]),
            avoidedScope3Tco2e=float(r[6]),
            complianceRationale=r[7],
            executiveSummary=r[8],
            generatedAt=r[9].isoformat() if hasattr(r[9], 'isoformat') else str(r[9])
        )


def execute_reroute(memo_id: str) -> RerouteExecutionResponse:
    with get_db_cursor(commit=True) as cur:
        # 1. Fetch memo
        cur.execute("""
            SELECT 
                m.id, m.disrupted_supplier_id, m.alternate_supplier_id, m.alternate_name, 
                m.avoided_scope3_tco2e, s.name, s.org_id, s.tier, s.material_category, s.spend
            FROM mitigation_memos m
            JOIN suppliers s ON s.id = m.disrupted_supplier_id
            WHERE m.id = %s
        """, (memo_id,))
        memo_row = cur.fetchone()
        if not memo_row:
            raise ValueError(f"Mitigation memo with ID {memo_id} not found")

        (
            m_id, disrupted_id, alt_id, alt_name,
            avoided_co2, disrupted_name, org_id, tier,
            material_cat, spend
        ) = (
            str(memo_row[0]), str(memo_row[1]), str(memo_row[2]), memo_row[3],
            float(memo_row[4]), memo_row[5], str(memo_row[6]), int(memo_row[7]),
            memo_row[8], float(memo_row[9] or 0.0)
        )

        # 2. Fetch alternate details
        cur.execute("""
            SELECT id, name, country, country_code, price_index, lead_time_days, emissions_factor, certifications
            FROM alternate_suppliers
            WHERE id = %s
        """, (alt_id,))
        alt_row = cur.fetchone()
        if not alt_row:
            raise ValueError(f"Alternate supplier with ID {alt_id} not found")

        a_country, a_country_code, a_price_idx, a_lead_time, a_certs = (
            alt_row[2], alt_row[3], float(alt_row[4]), int(alt_row[5]), alt_row[7] or []
        )

        # 3. Ensure alternate exists in suppliers table
        cur.execute("SELECT id FROM suppliers WHERE id = %s", (alt_id,))
        if not cur.fetchone():
            alt_code = f"ALT-{a_country_code}-{tier}"
            cur.execute("""
                INSERT INTO suppliers (
                    id, org_id, name, code, country, country_code, tier, material_category,
                    certifications, spend, lead_time_days, status, risk_score, is_spof
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'NOMINAL', 0.05, FALSE)
                ON CONFLICT (code) DO UPDATE SET status = 'NOMINAL', risk_score = 0.05
            """, (
                alt_id, org_id, alt_name, alt_code, a_country, a_country_code, tier,
                material_cat, a_certs, spend * a_price_idx, a_lead_time
            ))
        else:
            cur.execute("UPDATE suppliers SET status = 'NOMINAL', risk_score = 0.05 WHERE id = %s", (alt_id,))

        # 4. Rewire supplier_edges
        cur.execute("""
            UPDATE supplier_edges
            SET child_supplier_id = %s, lead_time_days = %s
            WHERE child_supplier_id = %s
        """, (alt_id, a_lead_time, disrupted_id))

        # 5. Clean disruption events & reset statuses in org
        cur.execute("DELETE FROM disruption_events WHERE supplier_id = %s", (disrupted_id,))
        cur.execute("UPDATE suppliers SET status = 'NOMINAL', risk_score = 0.05 WHERE org_id = %s", (org_id,))

    updated_dag = get_supply_chain_dag(org_id)

    return RerouteExecutionResponse(
        success=True,
        message=f"Autonomous reroute executed: swapped {disrupted_name} with certified alternate {alt_name}. Supply chain DAG rewired and downstream assembly corridors restored to nominal status.",
        memoId=m_id,
        previousSupplierId=disrupted_id,
        previousSupplierName=disrupted_name,
        newSupplierId=alt_id,
        newSupplierName=alt_name,
        avoidedScope3Tco2e=avoided_co2,
        updatedDAG=updated_dag.model_dump()
    )


def get_portfolio_analytics(org_id: str) -> PortfolioBreakdownResponse:
    with get_db_cursor() as cur:
        # 1. By Country
        cur.execute("""
            SELECT 
                country,
                country_code,
                (SUM(spend) * 1000000)::float AS spend_usd,
                COUNT(*)::int AS supplier_count,
                (SUM(CASE WHEN status IN ('CRITICAL', 'ELEVATED') THEN spend * 1000000 ELSE 0 END))::float AS at_risk_spend,
                MAX(risk_score)::float AS highest_risk,
                CASE 
                    WHEN MAX(risk_score) >= 0.70 THEN 'CRITICAL'
                    WHEN MAX(risk_score) >= 0.35 THEN 'ELEVATED'
                    ELSE 'NOMINAL'
                END AS status
            FROM suppliers
            WHERE org_id = %s
            GROUP BY country, country_code
            ORDER BY spend_usd DESC
        """, (org_id,))
        by_country = [
            CountrySpendBreakdown(
                country=r[0],
                countryCode=r[1],
                spendUSD=float(r[2]),
                supplierCount=int(r[3]),
                atRiskSpendUSD=float(r[4]),
                highestRiskScore=float(r[5]),
                status=SupplierStatus(r[6])
            )
            for r in cur.fetchall()
        ]

        # 2. By Tier
        cur.execute("""
            SELECT 
                tier,
                CASE tier
                    WHEN 0 THEN 'Tier 0 (Assembly)'
                    WHEN 1 THEN 'Tier 1 (Sub-Assembly)'
                    WHEN 2 THEN 'Tier 2 (Components)'
                    WHEN 3 THEN 'Tier 3 (Processing)'
                    WHEN 4 THEN 'Tier 4 (Raw Materials)'
                    ELSE CONCAT('Tier ', tier)
                END AS tier_label,
                (SUM(spend) * 1000000)::float AS spend_usd,
                COUNT(*)::int AS supplier_count,
                (SUM(CASE WHEN status IN ('CRITICAL', 'ELEVATED') THEN spend * 1000000 ELSE 0 END))::float AS at_risk_spend
            FROM suppliers
            WHERE org_id = %s
            GROUP BY tier
            ORDER BY tier ASC
        """, (org_id,))
        by_tier = [
            TierSpendBreakdown(
                tier=int(r[0]),
                tierLabel=r[1],
                spendUSD=float(r[2]),
                supplierCount=int(r[3]),
                atRiskSpendUSD=float(r[4])
            )
            for r in cur.fetchall()
        ]

        # 3. ESG Compliance
        cur.execute("""
            SELECT 
                COUNT(*)::int AS total_suppliers,
                COUNT(CASE WHEN array_length(certifications, 1) > 0 THEN 1 END)::int AS certified_suppliers,
                COUNT(CASE WHEN certifications && ARRAY['RMI Cobalt Participant', 'IMO 2020 Clean Fuel Compliant', 'Towards Sustainable Mining', 'BIMCO'] THEN 1 END)::int AS labor_certified,
                COUNT(CASE WHEN certifications && ARRAY['ISO 14001', 'IRMA Verified', 'SBTi Verified Net-Zero', 'Green Marine EU'] THEN 1 END)::int AS env_certified
            FROM suppliers
            WHERE org_id = %s
        """, (org_id,))
        esg_row = cur.fetchone()
        total = esg_row[0] or 1
        certified = esg_row[1] or 0

        esg_metrics = ESGComplianceMetrics(
            totalSuppliers=total,
            certifiedSuppliersCount=certified,
            compliancePercentage=round((certified / total) * 100, 1),
            laborStandardsCertifiedCount=esg_row[2] or 0,
            environmentalCertifiedCount=esg_row[3] or 0
        )

        return PortfolioBreakdownResponse(
            orgId=org_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            byCountry=by_country,
            byTier=by_tier,
            esgCompliance=esg_metrics
        )
