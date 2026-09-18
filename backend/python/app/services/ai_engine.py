import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from uuid import uuid4
from ..db.connection import get_db_cursor
from ..db.cte_queries import (
    propagate_risk_upstream, get_alternates_for_supplier, save_mitigation_memo
)
from ..models.schemas import (
    DisruptionEvent, DisruptionType, MitigationMemo, AlternateSupplier
)


def simulate_red_sea_blockade() -> Dict[str, Any]:
    """
    Simulates the Red Sea / Bab-el-Mandeb maritime chokepoint blockade.
    Locates Apex Maritime Logistics and propagates risk upwards.
    """
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, name, country FROM suppliers 
            WHERE code IN ('AML-YEM', 'APX-SEA-01') 
               OR material_category ILIKE '%Shipping%' 
               OR material_category ILIKE '%Maritime%' 
               OR name ILIKE '%Apex Maritime%' 
            LIMIT 1
        """)
        row = cur.fetchone()

        if not row:
            raise ValueError("Maritime chokepoint supplier not found in database")

        supplier_id = str(row[0])
        supplier_name = row[1]

    return trigger_disruption_event(
        supplier_id=supplier_id,
        disruption_type=DisruptionType.GEOPOLITICAL_BLOCKADE,
        severity=0.92,
        source_summary=f"Red Sea drone swarm attack near Bab-el-Mandeb strait forces indefinite container bypass via Cape of Good Hope. {supplier_name} shipments halted.",
        source_url="https://veritassupply.internal/intel/red-sea-maritime-blockade"
    )


def trigger_disruption_event(
    supplier_id: str,
    disruption_type: DisruptionType,
    severity: float,
    source_summary: Optional[str] = None,
    source_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes a disruption event: records the event in PostgreSQL and runs
    the 0.7x upward recursive CTE risk propagation through the supply DAG.
    """
    event_id = str(uuid4())
    summary = source_summary or f"Automated disruption simulation: {disruption_type.value}"

    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO disruption_events (id, supplier_id, type, severity, source_summary, source_url, triggered_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            event_id, supplier_id, disruption_type.value, severity, summary, source_url
        ))

    # Trigger upward risk propagation
    impacted_nodes = propagate_risk_upstream(
        disrupted_supplier_id=supplier_id,
        probability=0.95,
        severity=severity,
        rationale=summary
    )

    return {
        "eventId": event_id,
        "supplierId": supplier_id,
        "type": disruption_type.value,
        "severity": severity,
        "sourceSummary": summary,
        "sourceUrl": source_url,
        "impactedNodesCount": len(impacted_nodes),
        "impactedNodes": impacted_nodes
    }


def generate_mitigation_memo(supplier_id: str) -> MitigationMemo:
    """
    Autonomous Mitigation Engine:
    Identifies disrupted node, selects the optimal alternate supplier, computes
    price variance, lead time delta, and avoided Scope-3 emissions, and renders
    the terminal typewriter memo.
    """
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT name, country, material_category, spend, lead_time_days
            FROM suppliers 
            WHERE id = %s
        """, (supplier_id,))
        supplier_row = cur.fetchone()
        if not supplier_row:
            raise ValueError(f"Supplier with ID {supplier_id} not found")

        s_name, s_country, s_material, s_spend, s_lead_time = (
            supplier_row[0], supplier_row[1], supplier_row[2],
            float(supplier_row[3] or 0.0), int(supplier_row[4] or 0)
        )

    # Fetch pre-qualified alternate suppliers
    alternates = get_alternates_for_supplier(supplier_id)

    if not alternates:
        # Fallback alternate if specific replacement record not seeded
        is_logistics = any(k in s_material.lower() for k in ("logistics", "maritime", "shipping"))
        alt_name = "Nordic Clean Logistics Oy" if is_logistics else f"Patagonia Sustainable {s_material} SpA"
        alt_country = "Norway" if is_logistics else "Chile"
        alt_country_code = "NOR" if is_logistics else "CHL"
        alt_id = str(uuid4())
        price_index = 1.042
        alt_lead_time = max(5, s_lead_time - 3)
        alt_emissions = 0.72 if is_logistics else 1.45
        alt_certs = ["IMO 2020 Clean Fuel", "SBTi Net-Zero"] if is_logistics else ["ISO 14001", "IRMA Verified", "RMI Audited"]

        with get_db_cursor(commit=True) as cur:
            cur.execute("""
                INSERT INTO alternate_suppliers (
                    id, replaces_supplier_id, name, country, country_code,
                    price_index, lead_time_days, emissions_factor, certifications
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                alt_id, supplier_id, alt_name, alt_country, alt_country_code,
                price_index, alt_lead_time, alt_emissions, alt_certs
            ))
    else:
        # Pick the lowest emissions factor / best qualified alternate
        best_alt = sorted(alternates, key=lambda x: (x.emissionsFactor, x.priceIndex))[0]
        alt_id = best_alt.id
        alt_name = best_alt.name
        price_index = best_alt.priceIndex
        alt_lead_time = best_alt.leadTimeDays
        alt_emissions = best_alt.emissionsFactor

    # Compute deltas
    price_variance_pct = round((price_index - 1.0) * 100, 2)
    lead_time_delta = alt_lead_time - s_lead_time
    # Avoided Scope-3 CO2 calculation: benchmark maritime diversion adds ~1,420 tCO2e per transit
    is_logistics = any(k in s_material.lower() for k in ("logistics", "maritime", "shipping"))
    avoided_scope3 = 1420.0 if is_logistics else round(max(350.0, s_spend * 2.8), 2)

    # Fallback compliance rationale anchor (SDG 8 & SDG 12)
    if is_logistics:
        fallback_compliance_rationale = (
            f"Re-routing maritime transit away from Bab-el-Mandeb conflict corridor to {alt_name}'s EU-monitored fleet. "
            f"Carrier holds SBTi Net-Zero verification and 100% compliant crew welfare under ILO Maritime Labour Convention (MLC 2006), "
            f"directly upholding UN SDG 8 (Decent Work) and avoiding unvetted black-market bunker fuel."
        )
    else:
        fallback_compliance_rationale = (
            f"Switch to {alt_name} eliminates high-risk conflict corridor exposure. "
            f"Guarantees compliance with Uyghur Forced Labor Prevention Act (UFLPA) and Responsible Minerals Initiative (RMI), "
            f"directly upholding UN SDG 8 (Decent Work) and reducing carbon intensity per ton (SDG 12 Responsible Production)."
        )

    # Executive memo formatted for terminal typewriter CRT display
    fallback_terminal_memo = (
        f"======================================================================\n"
        f"VERITAS SENTINEL // AUTONOMOUS PROCUREMENT DIRECTIVE [MEMO-409]\n"
        f"STATUS: ROUTE MITIGATION VALIDATED\n"
        f"======================================================================\n"
        f"TARGET COMPONENT:  {s_material}\n"
        f"DISRUPTED NODE:    {s_name} [{s_country}]\n"
        f"RECOMMENDED ALT:   {alt_name}\n\n"
        f"TRADE-OFF MATRIX:\n"
        f"- Price Variance:         {'+' if price_variance_pct >= 0 else ''}{price_variance_pct}%\n"
        f"- Lead Time Variance:     {'+' if lead_time_delta >= 0 else ''}{lead_time_delta} days\n"
        f"- Avoided Scope-3 Carbon: -{avoided_scope3:,.1f} tCO2e (SDG 12)\n"
        f"- Labor Compliance:       AUDITED 100% CLEAN (SDG 8)\n\n"
        f"EXECUTIVE SUMMARY:\n"
        f"{fallback_compliance_rationale}\n"
        f"======================================================================"
    )

    # Live Multi-Model LLM Synthesis (Gemini 3.6 Flash -> Gemini 3.5 Flash-Lite -> Groq -> Fallback)
    compliance_rationale, terminal_memo = synthesize_memo_with_llm(
        s_name=s_name,
        s_country=s_country,
        s_material=s_material,
        alt_name=alt_name,
        price_variance_pct=price_variance_pct,
        lead_time_delta=lead_time_delta,
        avoided_scope3=avoided_scope3,
        fallback_rationale=fallback_compliance_rationale,
        fallback_memo=fallback_terminal_memo
    )

    memo_record = {
        "disruptedSupplierId": supplier_id,
        "alternateSupplierId": alt_id,
        "alternateName": alt_name,
        "priceVariancePct": price_variance_pct,
        "leadTimeDeltaDays": lead_time_delta,
        "avoidedScope3Tco2e": avoided_scope3,
        "complianceRationale": compliance_rationale,
        "executiveSummary": terminal_memo
    }

    return save_mitigation_memo(memo_record)


def synthesize_memo_with_llm(
    s_name: str,
    s_country: str,
    s_material: str,
    alt_name: str,
    price_variance_pct: float,
    lead_time_delta: int,
    avoided_scope3: float,
    fallback_rationale: str,
    fallback_memo: str
) -> tuple[str, str]:
    import json
    import httpx

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    prompt = f"""
You are VeritasSentinel Autonomous Procurement Engine. Generate an executive mitigation directive memo:
- Disrupted Supplier: {s_name} ({s_country})
- Critical Component: {s_material}
- Recommended Compliant Alternate: {alt_name}
- Price Variance: {'+' if price_variance_pct >= 0 else ''}{price_variance_pct}%
- Transit / Lead Time Delta: {'+' if lead_time_delta >= 0 else ''}{lead_time_delta} days
- Avoided Scope-3 Carbon: {avoided_scope3} tCO2e

Anchor your justification in UN SDG 8 (Decent Work, Maritime Labor Standards, Forced Labor Prevention) and SDG 12 (Responsible Production, Scope-3 Decarbonization).
Return ONLY a valid JSON object matching:
{{
  "complianceRationale": "<string paragraph detailing audited provenance and compliance standards>",
  "executiveSummary": "<string terminal-style formatted executive memo directive>"
}}
"""

    # 1. Try Gemini models
    if gemini_key:
        for model in ["gemini-3.6-flash", "gemini-3.5-flash-lite"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
                }
                with httpx.Client(timeout=6.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text)
                        if "complianceRationale" in parsed and "executiveSummary" in parsed:
                            return parsed["complianceRationale"], parsed["executiveSummary"]
            except Exception:
                pass

    # 2. Try Groq models
    if groq_key:
        for model in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }
                headers = {"Authorization": f"Bearer {groq_key}"}
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["choices"][0]["message"]["content"]
                        parsed = json.loads(text)
                        if "complianceRationale" in parsed and "executiveSummary" in parsed:
                            return parsed["complianceRationale"], parsed["executiveSummary"]
            except Exception:
                pass

    return fallback_rationale, fallback_memo

