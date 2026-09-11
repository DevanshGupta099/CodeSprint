import pytest
from fastapi.testclient import TestClient
from backend.python.app.main import app

client = TestClient(app)

ORG_ID = "00000000-0000-0000-0000-000000000001"
APEX_SUPPLIER_ID = "30000000-0000-0000-0000-000000000001"  # Apex Maritime Logistics (Tier 3 chokepoint)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["databaseConnected"] is True
    assert "FastAPI + NetworkX" in data["engine"]


def test_get_supply_chain_dag():
    response = client.get(f"/api/supply-chain/{ORG_ID}")
    assert response.status_code == 200
    data = response.json()
    assert "Veritas Motors" in data["organization"]["name"]
    assert len(data["nodes"]) >= 5
    assert len(data["edges"]) >= 4

    # Verify Tier levels present (0 through 4)
    tiers = {node["tier"] for node in data["nodes"]}
    assert 0 in tiers
    assert 4 in tiers

    # Verify edge connectivity
    edge = data["edges"][0]
    assert "parentSupplierId" in edge
    assert "childSupplierId" in edge
    assert "componentName" in edge


def test_networkx_spof_analytics():
    response = client.get(f"/api/analytics/spofs/{ORG_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["orgId"] == ORG_ID
    assert "singlePointsOfFailure" in data
    assert "bridgeEdges" in data
    assert "betweennessCentrality" in data

    # Check that articulation points and bridges were identified
    assert len(data["singlePointsOfFailure"]) > 0
    assert len(data["bridgeEdges"]) > 0


def test_simulate_red_sea_blockade_disruption():
    # Trigger Red Sea blockade (default trigger)
    response = client.post("/api/disruption/trigger", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "GEOPOLITICAL_BLOCKADE"
    assert data["severity"] > 0.8
    assert data["impactedNodesCount"] > 0

    # Verify risk state reflects the disruption
    risk_resp = client.get(f"/api/risk-state/{ORG_ID}")
    assert risk_resp.status_code == 200
    risk_data = risk_resp.json()
    assert risk_data["portfolioMetrics"]["totalSpendAtRiskUSD"] > 0

    # Ensure at least one node is marked CRITICAL or ELEVATED
    critical_or_elevated = [
        n for n in risk_data["nodes"] if n["status"] in ("CRITICAL", "ELEVATED")
    ]
    assert len(critical_or_elevated) > 0


def test_autonomous_mitigation_memo():
    response = client.post(f"/api/mitigation/{APEX_SUPPLIER_ID}")
    assert response.status_code == 200
    memo = response.json()
    assert memo["disruptedSupplierId"] == APEX_SUPPLIER_ID
    assert "alternateName" in memo
    assert memo["avoidedScope3Tco2e"] > 0
    assert "VERITAS SENTINEL" in memo["executiveSummary"]
    assert "SDG 12" in memo["executiveSummary"]


def test_reset_disruption():
    response = client.post(f"/api/disruption/reset/{ORG_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    # Verify risk state has returned to nominal
    risk_resp = client.get(f"/api/risk-state/{ORG_ID}")
    assert risk_resp.status_code == 200
    risk_data = risk_resp.json()
    for node in risk_data["nodes"]:
        assert node["status"] == "NOMINAL"


def test_invalid_organization_404():
    response = client.get("/api/supply-chain/99999999-9999-9999-9999-999999999999")
    assert response.status_code == 404


def test_get_candidate_alternates():
    response = client.get(f"/api/alternates/{APEX_SUPPLIER_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["supplierId"] == APEX_SUPPLIER_ID
    assert len(data["alternates"]) > 0
    assert data["alternates"][0]["name"] == "Nordic Horn Maritime Lines"


def test_csv_bom_ingest():
    sample_csv = (
        "supplierName,code,country,countryCode,tier,materialCategory,componentName,spendUsd,leadTimeDays,parentSupplierCode,shippingRoute,lat,lng\n"
        "Nordic Minerals Oy,NMO-FIN,Finland,FIN,3,Battery Minerals,Purified Nickel,42000000,28,VCD-KOR,Baltic Maritime,60.1699,24.9384\n"
    )
    files = {"file": ("test_bom.csv", sample_csv, "text/csv")}
    response = client.post("/api/ingest", files=files, data={"org_id": ORG_ID})
    assert response.status_code == 200
    data = response.json()
    assert "Successfully ingested 1 suppliers" in data["message"]
    assert len(data["dag"]["nodes"]) > 0


def test_disruption_scenario_catalog():
    response = client.get("/api/disruption/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 4
    keys = [s["key"] for s in data["scenarios"]]
    assert "RED_SEA_BLOCKADE" in keys
    assert "XINJIANG_UFLPA_SANCTIONS" in keys


def test_simulate_named_scenario():
    response = client.post("/api/disruption/simulate/XINJIANG_UFLPA_SANCTIONS")
    assert response.status_code == 200
    data = response.json()
    assert "disruption" in data
    assert data["targetSupplier"]["code"] == "SRS-CHN"
    assert data["disruption"]["disruptionType"] == "SANCTIONS_FORCED_LABOR"


def test_portfolio_analytics():
    response = client.get("/api/analytics/portfolio-breakdown")
    assert response.status_code == 200
    data = response.json()
    assert "byCountry" in data
    assert "byTier" in data
    assert "esgCompliance" in data
    assert len(data["byCountry"]) > 0
    assert len(data["byTier"]) == 5
    assert data["esgCompliance"]["compliancePercentage"] >= 0


def test_execute_reroute_endpoint():
    # Generate memo for Apex Maritime Logistics (Bab-el-Mandeb chokepoint)
    apex_supplier_id = "30000000-0000-0000-0000-000000000001"
    memo_res = client.post(f"/api/mitigation/{apex_supplier_id}")
    assert memo_res.status_code == 200
    memo_id = memo_res.json()["id"]

    # Execute reroute
    reroute_res = client.post(f"/api/mitigation/{memo_id}/execute")
    assert reroute_res.status_code == 200
    reroute_data = reroute_res.json()
    assert reroute_data["success"] is True
    assert "Nordic Horn Maritime Lines" in reroute_data["newSupplierName"]



