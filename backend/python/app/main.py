from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List

from .db.connection import get_connection_pool, check_database_health
from .db.cte_queries import (
    get_supply_chain_dag, get_risk_state, reset_risk_state, get_alternates_for_supplier,
    execute_reroute, get_portfolio_analytics
)
from .services.graph_analytics import analyze_spofs_and_bottlenecks
from .services.ai_engine import (
    simulate_red_sea_blockade, trigger_disruption_event, generate_mitigation_memo
)
from .services.ingestion import parse_bom_csv, ingest_bom_items
from .services.scenarios import get_scenario_catalog, simulate_scenario
from .models.schemas import (
    SupplyChainDAGResponse, RiskStateResponse, MitigationMemo,
    TriggerDisruptionRequest, SPOFAnalysisResponse,
    DisruptionScenario, RerouteExecutionResponse, PortfolioBreakdownResponse
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure connection pool is initialized and DB is reachable
    try:
        pool = get_connection_pool()
        if not check_database_health():
            print("[WARN] Python backend: PostgreSQL health check returned False. Verify DB credentials.")
        else:
            print("[INFO] Python backend: PostgreSQL pool successfully initialized.")
    except Exception as e:
        print(f"[ERROR] Python backend: Database initialization error: {e}")
    yield
    # Shutdown: Close pool
    try:
        pool = get_connection_pool()
        pool.closeall()
        print("[INFO] Python backend: Connection pool closed.")
    except Exception:
        pass


app = FastAPI(
    title="VeritasSupply AI Intelligence & Mitigation Engine",
    description="Tier-N Supply Chain Disruption, Recursive CTE Risk Propagation, and Autonomous Mitigation (FastAPI + NetworkX)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check() -> Dict[str, Any]:
    db_ok = check_database_health()
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "VeritasSupply AI Python Intelligence Engine",
        "databaseConnected": db_ok,
        "engine": "FastAPI + NetworkX + PostgreSQL Recursive CTEs",
        "version": "1.0.0"
    }


@app.get("/api/supply-chain/{org_id}", response_model=SupplyChainDAGResponse, tags=["DAG Graph"])
def get_supply_chain(org_id: str):
    """
    Returns the complete supply chain hierarchy for the given organization,
    including nodes (suppliers Tier 0-4) and directional edges.
    """
    try:
        return get_supply_chain_dag(org_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/risk-state/{org_id}", response_model=RiskStateResponse, tags=["Risk Telemetry"])
def get_current_risk_state(org_id: str):
    """
    Returns the current real-time risk scores, statuses, and portfolio-wide
    financial risk exposure ($ at risk) and avoided Scope-3 emissions.
    """
    try:
        return get_risk_state(org_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/disruption/trigger", tags=["Disruption Sentinel"])
def trigger_disruption(payload: TriggerDisruptionRequest = TriggerDisruptionRequest()):
    """
    Triggers a supply disruption (e.g. Red Sea blockade or sanctions).
    Runs PostgreSQL recursive CTE risk propagation with 0.7x decay up the DAG.
    """
    try:
        if not payload.supplierId:
            # Default trigger: Simulate Red Sea Bab-el-Mandeb Blockade on Apex Maritime Logistics
            return simulate_red_sea_blockade()
        else:
            return trigger_disruption_event(
                supplier_id=payload.supplierId,
                disruption_type=payload.type,
                severity=payload.severity,
                source_summary=payload.sourceSummary,
                source_url=payload.sourceUrl
            )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/disruption/reset/{org_id}", tags=["Disruption Sentinel"])
def reset_disruption(org_id: str):
    """
    Resets all supplier risk scores back to nominal baseline (0.05 / NOMINAL).
    """
    try:
        reset_risk_state(org_id)
        return {
            "success": True,
            "message": f"Risk state for organization {org_id} successfully reset to nominal baseline."
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/mitigation/execute", response_model=RerouteExecutionResponse, tags=["Mitigation Engine"])
async def execute_mitigation_reroute(request: Request):
    """
    Executes autonomous rerouting: re-points DAG edges to certified alternate and restores nominal status.
    """
    try:
        body = await request.json()
        memo_id = body.get("memoId") or body.get("memo_id")
        if not memo_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required field: memoId")
        return execute_reroute(memo_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/mitigation/{memo_id}/execute", response_model=RerouteExecutionResponse, tags=["Mitigation Engine"])
def execute_mitigation_reroute_by_param(memo_id: str):
    """
    Executes autonomous rerouting by memo ID path parameter.
    """
    try:
        return execute_reroute(memo_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/mitigation/{supplier_id}", response_model=MitigationMemo, tags=["Mitigation Engine"])
def generate_mitigation(supplier_id: str):
    """
    Autonomous Mitigation Engine: selects optimal qualified alternative,
    computes price variance, lead time delta, and avoided Scope-3 emissions (SDG 12 & 8),
    and generates the CRT terminal typewriter procurement memo.
    """
    try:
        memo = generate_mitigation_memo(supplier_id)
        return memo
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/disruption/scenarios", tags=["Disruption Sentinel"])
def list_disruption_scenarios():
    """
    Returns the multi-scenario disruption catalog anchored to SDG 8 and SDG 12.
    """
    return {"scenarios": get_scenario_catalog()}


@app.post("/api/disruption/simulate/{scenario_key}", tags=["Disruption Sentinel"])
def simulate_named_scenario(scenario_key: str):
    """
    Triggers a named disruption scenario from the catalog (e.g. XINJIANG_UFLPA_SANCTIONS, DRC_COBALT_MORATORIUM).
    """
    try:
        return simulate_scenario(scenario_key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/analytics/portfolio-breakdown", response_model=PortfolioBreakdownResponse, tags=["Graph Analytics"])
@app.get("/api/analytics/portfolio-breakdown/{org_id}", response_model=PortfolioBreakdownResponse, tags=["Graph Analytics"])
def get_portfolio_breakdown(org_id: str = "00000000-0000-0000-0000-000000000001"):
    """
    Provides aggregated spend by country, tier, and ESG certification compliance metrics for Recharts dashboards.
    """
    try:
        return get_portfolio_analytics(org_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/analytics/spofs/{org_id}", response_model=SPOFAnalysisResponse, tags=["Graph Analytics"])
def analyze_spofs(org_id: str):
    """
    NetworkX graph intelligence: detects articulation points (Single Points of Failure),
    bridge edges (single transit bottlenecks), and computes betweenness centrality.
    """
    try:
        return analyze_spofs_and_bottlenecks(org_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/alternates/{supplier_id}", tags=["Mitigation Engine"])
def get_candidate_alternates(supplier_id: str):
    """
    Retrieves candidate pre-qualified alternate suppliers for a given supplier node.
    """
    try:
        alternates = get_alternates_for_supplier(supplier_id)
        return {
            "supplierId": supplier_id,
            "alternates": alternates
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/ingest", tags=["BOM Ingestion"])
async def ingest_bom(request: Request):
    """
    Ingests BOM data via multipart CSV upload or JSON lineItems payload,
    reconstructs supplier hierarchy and edges, and returns the updated DAG.
    """
    content_type = request.headers.get("content-type", "")
    target_org_id = "00000000-0000-0000-0000-000000000001"
    items = []

    try:
        if "application/json" in content_type:
            body = await request.json()
            target_org_id = body.get("orgId") or body.get("org_id") or target_org_id
            items = body.get("lineItems") or body.get("line_items") or []
            if not items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid lineItems array found in JSON payload"
                )
        else:
            form = await request.form()
            target_org_id = form.get("orgId") or form.get("org_id") or target_org_id
            upload = form.get("file")
            if not upload or not hasattr(upload, "read"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please upload a CSV file as form-data (field: 'file') or provide a JSON array 'lineItems'"
                )
            content = await upload.read()
            csv_text = content.decode("utf-8")
            items, errors = parse_bom_csv(csv_text)
            if not items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No valid BOM line items found: {errors}"
                )

        result = ingest_bom_items(target_org_id, items)
        return {
            "message": f"Successfully ingested {result['ingestedSuppliersCount']} suppliers and linked {result['linkedEdgesCount']} edges",
            "dag": result["dag"]
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/scenarios/boms", tags=["Scenarios"])
def get_bom_presets():
    """
    Returns available multi-BOM architecture presets (EV Battery, Aerospace Satellite, Semiconductor MCU).
    """
    presets = [
        {
            "key": "EV_BATTERY_PACK",
            "title": "Flagship 800V EV Battery Pack & Powertrain",
            "industry": "Automotive & Clean Mobility (SDG 12)",
            "description": "11 Tier-0 to Tier-4 nodes spanning Chile lithium, DRC cobalt, German battery modules, and Bab-el-Mandeb chokepoint.",
            "fileName": "sample-ev-battery-bom.csv",
            "nodeCount": 11,
            "primaryChokepoint": "Apex Maritime Logistics (Bab-el-Mandeb Strait // SPOF)",
        },
        {
            "key": "AEROSPACE_SATELLITE",
            "title": "LEO Constellation Satellite Bus & Hall Thrusters",
            "industry": "Aerospace & Defense Telemetry",
            "description": "12 Tier-0 to Tier-4 nodes spanning French electric propulsion, German space solar arrays, and Malacca Strait shipping.",
            "fileName": "sample-aerospace-satellite-bom.csv",
            "nodeCount": 12,
            "primaryChokepoint": "Strait Maritime Heavy Freight (Strait of Malacca // SPOF)",
        },
        {
            "key": "SEMICONDUCTOR_MCU",
            "title": "Automotive Grade-0 Microcontroller & Photolithography",
            "industry": "Advanced Semiconductors & Electronics",
            "description": "11 Tier-0 to Tier-4 nodes spanning Taiwanese 28nm foundries, Ukrainian laser neon gas refiners, and Xinjiang silicon.",
            "fileName": "sample-semiconductor-microcontroller-bom.csv",
            "nodeCount": 11,
            "primaryChokepoint": "Odesa Noble Gas Refiners (Black Sea Corridor // SPOF)",
        },
    ]
    return {"count": len(presets), "presets": presets}


@app.get("/api/disruption/bulletin/{scenario_key}", tags=["Disruption Sentinel"])
def get_disruption_bulletin(scenario_key: str, country: str = "Global Corridor"):
    """
    Returns live maritime & trade disruption intelligence bulletin.
    """
    bulletins = {
        "RED_SEA_BLOCKADE": {
            "sourceAgency": "United Kingdom Maritime Trade Operations (UKMTO) / Joint Maritime Information Center",
            "advisoryLevel": "CRITICAL HAZARD // CODE RED",
            "timestamp": "2026-09-15T09:30:00Z",
            "headline": "Missile Strikes & Drone Incursions Verified in Southern Red Sea / Bab-el-Mandeb Strait",
            "maritimeCoordinates": "12°35'N 043°20'E (Hanish Islands to Perim Island)",
            "affectedCorridor": "Bab-el-Mandeb Shipping Lane (Mandatory Divert via Cape of Good Hope)",
            "recommendedAction": "Immediate rerouting to secondary South Atlantic freight carriers with audited dual-fuel propulsion (UN SDG 12).",
        },
        "XINJIANG_UFLPA_SANCTIONS": {
            "sourceAgency": "US Customs and Border Protection (CBP) // Uyghur Forced Labor Prevention Act Directive",
            "advisoryLevel": "REGULATORY EMBARGO // DETENTION ORDER",
            "timestamp": "2026-09-15T09:30:00Z",
            "headline": "Immediate Withhold Release Order Enforced on Polysilicon Substrates and Quartz Sand Smelters",
            "maritimeCoordinates": "43°49'N 087°37'E (Xinjiang Uygur Autonomous Region)",
            "affectedCorridor": "Trans-Eurasian Overland Silk Rail & Western Port Consignments",
            "recommendedAction": "Execute full provenance audit and reroute silicon procurement to certified conflict-free domestic or EU smelters (UN SDG 8).",
        },
        "DRC_COBALT_MORATORIUM": {
            "sourceAgency": "OECD Responsible Mineral Supply Chains Directorate // DRC Ministry of Mines",
            "advisoryLevel": "ETHICAL SOURCING EMBARGO // LEVEL 4",
            "timestamp": "2026-09-15T09:30:00Z",
            "headline": "Emergency Moratorium on Artisanal Cobalt Ore Exports Following Child Labor Audit Failure",
            "maritimeCoordinates": "10°43'S 025°28'E (Katanga Copper-Cobalt Belt)",
            "affectedCorridor": "East African Mineral Export Highway (Lubumbashi to Dar es Salaam)",
            "recommendedAction": "Activate mass-balance traceability and transition cathode supply to certified recycled or Australian spodumene refiners.",
        },
        "ATACAMA_WATER_CRISIS": {
            "sourceAgency": "Chilean Environmental Superintendency (SMA) // First Environmental Court of Antofagasta",
            "advisoryLevel": "ENVIRONMENTAL CEASE-AND-DESIST // SEVERE",
            "timestamp": "2026-09-15T09:30:00Z",
            "headline": "Emergency Injunction Halting Brine Pumping in Salar de Atacama due to Extreme Aquifer Depletion",
            "maritimeCoordinates": "23°51'S 067°08'W (Salar de Atacama Salt Flat Basin)",
            "affectedCorridor": "Antofagasta Port Mineral Terminal & South American Pacific Rail",
            "recommendedAction": "Shift lithium refining volume to closed-loop direct lithium extraction (DLE) facilities with zero freshwater consumption (UN SDG 12).",
        }
    }
    b = bulletins.get(scenario_key, {
        "sourceAgency": "Veritas Disruption Sentinel Intelligence Service",
        "advisoryLevel": "ELEVATED MONITORING",
        "timestamp": "2026-09-15T09:30:00Z",
        "headline": f"Supply Chain Anomaly Detected in {country}",
        "maritimeCoordinates": "Lat 0.00 / Lng 0.00",
        "affectedCorridor": "Global Commercial Freight",
        "recommendedAction": "Inspect upstream dependency tier and prepare pre-qualified alternate suppliers.",
    })
    return {"scenarioKey": scenario_key, "bulletin": b}


