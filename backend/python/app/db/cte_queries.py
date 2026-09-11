from datetime import datetime, timezone
from typing import List, Dict, Any
from .connection import get_db_cursor
from ..models.schemas import (
    Supplier, SupplierEdge, Organization, SupplyChainDAGResponse,
    RiskStateResponse, RiskNodeTelemetry, PortfolioMetrics,
    AlternateSupplier, MitigationMemo, SupplierStatus
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
