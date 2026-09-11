from typing import List, Dict, Any
from ..models.schemas import DisruptionScenario, DisruptionType
from ..db.connection import get_db_cursor
from .ai_engine import trigger_disruption_event

SCENARIO_CATALOG: Dict[str, DisruptionScenario] = {
    "RED_SEA_BLOCKADE": DisruptionScenario(
        key="RED_SEA_BLOCKADE",
        title="Red Sea & Bab-el-Mandeb Maritime Chokepoint Blockade",
        targetSupplierCode="AML-YEM",
        targetSupplierName="Apex Maritime Logistics",
        disruptionType=DisruptionType.GEOPOLITICAL_BLOCKADE,
        severity=0.92,
        sdgAnchor="SDG 8 (Decent Work & Maritime Crew Welfare) / SDG 12 (Avoided Scope-3 Emissions)",
        narrative="Houthi drone swarm and missile strikes near Bab-el-Mandeb strait force indefinite container bypass via Cape of Good Hope. Apex Maritime shipments halted with cascading lead-time inflation."
    ),
    "XINJIANG_UFLPA_SANCTIONS": DisruptionScenario(
        key="XINJIANG_UFLPA_SANCTIONS",
        title="Xinjiang Polysilicon Forced Labor Withhold Release Order (UFLPA)",
        targetSupplierCode="SRS-CHN",
        targetSupplierName="Sino-Refine Silicon Co",
        disruptionType=DisruptionType.SANCTIONS_FORCED_LABOR,
        severity=0.88,
        sdgAnchor="SDG 8: Decent Work & Total Eradication of Forced Labor",
        narrative="US Customs and Border Protection (CBP) enforces immediate detention of polysilicon substrates under the Uyghur Forced Labor Prevention Act. All shipments from Sino-Refine Silicon confiscated at customs."
    ),
    "DRC_COBALT_MORATORIUM": DisruptionScenario(
        key="DRC_COBALT_MORATORIUM",
        title="DRC Artisanal Cobalt Mine Moratorium & Child Labor Audit",
        targetSupplierCode="KAO-COD",
        targetSupplierName="Katanga Artisanal Ore",
        disruptionType=DisruptionType.SANCTIONS_FORCED_LABOR,
        severity=0.95,
        sdgAnchor="SDG 8: Elimination of Hazardous Child Labor & Modern Slavery",
        narrative="Artisanal pit collapse and audit exposé in Katanga province triggers emergency export embargo on unvetted cobalt hydroxide, halting raw battery material exports across Tier-4 corridors."
    ),
    "ATACAMA_WATER_CRISIS": DisruptionScenario(
        key="ATACAMA_WATER_CRISIS",
        title="Atacama Basin Water Extraction Freeze & Aquifer Depletion",
        targetSupplierCode="ASB-CHL",
        targetSupplierName="Atacama Salt Brine Ltd",
        disruptionType=DisruptionType.NATURAL_DISASTER,
        severity=0.85,
        sdgAnchor="SDG 12: Sustainable Consumption & Water Resource Protection",
        narrative="Chilean Environmental Court orders immediate 60-day cessation of brine pumping due to critical aquifer depletion and indigenous community water rights infringement in the Salar de Atacama."
    )
}


def get_scenario_catalog() -> List[DisruptionScenario]:
    return list(SCENARIO_CATALOG.values())


def simulate_scenario(scenario_key: str) -> Dict[str, Any]:
    scenario = SCENARIO_CATALOG.get(scenario_key)
    if not scenario:
        raise ValueError(f"Scenario '{scenario_key}' not found. Available scenarios: {list(SCENARIO_CATALOG.keys())}")

    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, name FROM suppliers 
            WHERE code = %s OR name ILIKE %s 
            LIMIT 1
        """, (scenario.targetSupplierCode, f"%{scenario.targetSupplierName}%"))
        row = cur.fetchone()
        if not row:
            raise ValueError(f"Target supplier for scenario '{scenario.title}' not found in database.")

        supplier_id = str(row[0])
        supplier_name = row[1]

    disruption_res = trigger_disruption_event(
        supplier_id=supplier_id,
        disruption_type=scenario.disruptionType,
        severity=scenario.severity,
        source_summary=f"[SCENARIO: {scenario.key}] {scenario.narrative}",
        source_url=f"https://veritassupply.internal/intel/scenarios/{scenario.key.lower()}"
    )

    return {
        "disruption": {
            "id": disruption_res["eventId"],
            "supplierId": supplier_id,
            "disruptionType": scenario.disruptionType.value if hasattr(scenario.disruptionType, 'value') else scenario.disruptionType,
            "severity": scenario.severity,
            "sourceSummary": disruption_res["sourceSummary"]
        },
        "targetSupplier": {
            "id": supplier_id,
            "name": supplier_name,
            "code": scenario.targetSupplierCode
        },
        "impactedTiers": disruption_res["impactedNodesCount"],
        "riskPropagationSummary": f"Upward risk propagation complete: {disruption_res['impactedNodesCount']} upstream nodes impacted with 0.7x decay factor."
    }

