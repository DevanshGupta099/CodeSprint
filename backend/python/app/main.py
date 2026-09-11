from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List

from .db.connection import get_connection_pool, check_database_health
from .db.cte_queries import (
    get_supply_chain_dag, get_risk_state, reset_risk_state, get_alternates_for_supplier
)
from .services.graph_analytics import analyze_spofs_and_bottlenecks
from .services.ai_engine import (
    simulate_red_sea_blockade, trigger_disruption_event, generate_mitigation_memo
)
from .services.ingestion import parse_bom_csv, ingest_bom_items
from .models.schemas import (
    SupplyChainDAGResponse, RiskStateResponse, MitigationMemo,
    TriggerDisruptionRequest, SPOFAnalysisResponse
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


@app.post("/api/mitigation/{supplier_id}", response_model=MitigationMemo, tags=["Mitigation Engine"])
def generate_mitigation(supplier_id: str):
    """
    Autonomous Mitigation Engine: selects optimal qualified alternative,
    computes price variance, lead time delta, and avoided Scope-3 emissions (SDG 12 & 8),
    and generates the CRT terminal typewriter procurement memo.
    """
    try:
        return generate_mitigation_memo(supplier_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
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
async def ingest_bom(
    file: Optional[UploadFile] = File(None),
    org_id: Optional[str] = Form(None)
):
    """
    Ingests BOM data via multipart CSV upload, reconstructs supplier hierarchy and edges,
    and returns the updated DAG.
    """
    target_org_id = org_id or "00000000-0000-0000-0000-000000000001"
    try:
        if not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please upload a CSV file as form-data (field: 'file')"
            )

        content = await file.read()
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
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


