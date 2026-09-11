# VeritasSupply — Backend Intelligence Engine Documentation

> **Lead Architect**: Contributor A (Devansh)  
> **Core Stack**: PostgreSQL 18 + Node.js (TypeScript / Express) + Python 3.14 (FastAPI / NetworkX / Pydantic v2)  
> **Status**: **100% Complete, Hardened & Verified (16/16 Node Security Tests + 5/5 Node Expansion Tests + 13/13 Pytest Tests Passing)**

---

## 1. Executive Summary & Purpose

**VeritasSupply** is an **Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine**.

Manufacturers typically only have direct visibility into their immediate **Tier-1 suppliers**. If a flood strikes a Tier-3 lithium brine refiner in Chile, or sanctions are imposed on a Tier-4 cobalt mine in the DRC, the disruption remains invisible until assembly lines halt weeks later.

VeritasSupply solves this by:
1. **Ingesting Bills of Materials (BOM)** via CSV or JSON.
2. **Reconstructing the full N-Tier dependency graph** using PostgreSQL Recursive Common Table Expressions (CTEs).
3. **Simulating upstream geopolitical & environmental disruptions** (e.g., Red Sea Bab-el-Mandeb chokepoint blockade).
4. **Propagating risk upwards** through the DAG with a strict $0.7\times$ attenuation factor per hop.
5. **Autonomously mitigating disrupted nodes** by selecting pre-vetted alternatives, calculating trade-off deltas (Price %, Lead Time days, Avoided Scope-3 Carbon for **SDG 12**, and UFLPA labor compliance for **SDG 8**), and generating an executive CRT typewriter procurement memo.
6. **Detecting Single Points of Failure (SPOFs)** using NetworkX graph topology analytics (articulation points, bridge edges, betweenness centrality).

---

## 2. Progress & Implementation Log

Everything built by Contributor A to date, structured chronologically:

### Phase 1: Database DDL & Seed Architecture
- **Relational Schema** ([`backend/db/schema.sql`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/db/schema.sql)):
  - Provisioned database `veritassupply` on local PostgreSQL 18.
  - Implemented tables: `organizations`, `suppliers` (Tiers 0–4), `supplier_edges` (DAG mappings), `disruption_events`, `risk_scores`, `alternate_suppliers`, `mitigation_memos`.
  - Added unique constraint on `suppliers(code)` and `supplier_edges(parent_supplier_id, child_supplier_id)`.
- **Storytelling Seed Dataset** ([`backend/db/seed.sql`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/db/seed.sql)):
  - **Tier 0**: Veritas Motors Corp (`Veritas Assembly Gigafactory`, USA).
  - **Tier 1**: `Apex Power Systems GmbH` (Germany - Battery Packs), `DriveTech Inverters Ltd` (Japan - SiC Inverters).
  - **Tier 2**: `Voltaic Cell Dynamics` (South Korea - Cells), `Munich BMS Modules` (Germany), `Kobe Precision Copper` (Japan).
  - **Tier 3**: `Apex Maritime Logistics` (Djibouti/Yemen - Red Sea Bab-el-Mandeb **SPOF** chokepoint), `Atacama Salt Brine Ltd` (Chile - Lithium), `Sino-Refine Silicon Co` (Xinjiang - Silicon).
  - **Tier 4**: `Katanga Artisanal Ore` (DR Congo - Cobalt **SPOF**), `Pilbara Spodumene Corp` (Australia - Lithium).
  - **Alternates**: `Nordic Horn Maritime Lines` (Norway - Cape route alternative, +4.2% price, -3 days, -1,420 tCO2e avoided carbon), `Pacific Direct Bulk Carrier`, `Trans-Sahara Multimodal Freight`.

### Phase 2: Recursive CTE Algorithms
- **Downward Tree Reconstruction (`bom_tree`)**:
  - Reconstructs the complete hierarchical graph starting from the enterprise down to Tier 4 in exact topological depth order.
- **Upward Risk Propagation (`risk_up`)**:
  - Propagates disruption shocks upstream $\rightarrow$ downstream using mathematical decay:
    $$\text{Impact}_{\text{hop}} = \text{Probability} \times \text{Severity} \times (0.7)^{\text{depth}}$$
  - **Cycle-Protection Hardening**: Implemented array path tracking (`ARRAY[$1::uuid] AS path` and `WHERE NOT e.parent_supplier_id = ANY(r.path)`) with depth pruning (`AND r.decay > 0.01`), mathematically preventing infinite loops on circular or messy datasets.

### Phase 3: Dual-Backend Architecture
To support both high-speed Node.js API serving and advanced scientific Python graph computations, dual backends were constructed with 100% endpoint parity:
- **Node.js Express Backend (`backend/src/`)**:
  - Running on port `5000`.
  - Built with TypeScript, Express, `pg` pool, `multer`, and `zod`.
- **Python FastAPI Intelligence Backend (`backend/python/`)**:
  - Running on port `8000` with interactive Swagger docs at `http://localhost:8000/docs`.
  - Built with FastAPI, Pydantic v2, NetworkX, and `psycopg2-binary`.

### Phase 4: BOM Ingestion Pipeline
- Engineered quote-aware CSV parser handling commas inside quotes.
- Row-by-row Zod and Pydantic validation (`BOMLineItemSchema`).
- Ingestion endpoint `POST /api/ingest` upserts suppliers and links edges dynamically.
- Packaged realistic demo dataset: [`data/sample-ev-battery-bom.csv`](file:///c:/Users/Devansh/Downloads/CodeSprint/data/sample-ev-battery-bom.csv).

### Phase 5: Autonomous Mitigation & AI Sentinels
- **Disruption Sentinel**: `[SIMULATE RED SEA BLOCKADE]` automated trigger for Apex Maritime Logistics.
- **Mitigation Engine**: Evaluates qualified alternates, computes trade-off deltas, generates terminal typewriter CRT procurement memo text with SDG 8 & SDG 12 anchors, and records the memo in PostgreSQL.
- **Deterministic Fallbacks**: Every AI call includes deterministic fallback fixtures so external network timeouts or missing API keys never blank the screen during a live pitch.

### Phase 6: Graph Intelligence & SPOF Analytics
- Implemented NetworkX topology analyzer in `backend/python/app/services/graph_analytics.py`:
  - **Articulation Points (SPOFs)**: Identifies cut vertices whose failure partitions the graph.
  - **Bridge Corridors**: Isolates single transit links without alternative routing.
  - **Betweenness Centrality**: Ranks structural bottlenecks by shortest path centrality scores.
- Added endpoint parity in both Node.js (`GET /api/analytics/spofs/:orgId`) and Python (`GET /api/analytics/spofs/{org_id}`).

### Phase 7: Security & Query Hardening
- RFC 4122 UUID validation middleware preventing SQL injection (`' OR '1'='1'`) and PostgreSQL 22P02 errors.
- Enforced 10MB upload limits on CSV files and 1MB on JSON payloads.
- Added security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, disabled `X-Powered-By`).
- Scoped all telemetry queries (`avoidedScope3Tco2e`, `activeDisruptionsCount`) strictly to `org_id` to prevent multi-tenant data leaks.
- Enhanced disruption reset (`POST /api/disruption/reset/:orgId`) to delete active disruption records so `activeDisruptionsCount` returns cleanly to `0`.

### Phase 8: Contributor A Autonomous Expansions & Analytics Feeds
- **Autonomous Rerouting Engine (`POST /api/mitigation/execute`)**:
  - Closed-loop supply graph rewiring: fetches `mitigation_memos`, promotes alternate supplier into active `suppliers` table with `NOMINAL` status, rewires `supplier_edges` pointing downstream consumers to the alternate node, and clears disrupted state back to nominal ($0.05$).
- **Multi-Scenario Disruption Catalog (SDG 8 & SDG 12)**:
  - Preset catalog with 4 high-fidelity scenarios:
    1. `RED_SEA_BLOCKADE`: Apex Maritime Logistics (AML-YEM), severity 0.92, Bab-el-Mandeb bypass & crew safety.
    2. `XINJIANG_UFLPA_SANCTIONS`: Sino-Refine Silicon Co (SRS-CHN), severity 0.88, US CBP forced labor detention (SDG 8).
    3. `DRC_COBALT_MORATORIUM`: Katanga Artisanal Ore (KAO-COD), severity 0.95, child labor audit moratorium (SDG 8 & 12).
    4. `ATACAMA_WATER_CRISIS`: Atacama Salt Brine Ltd (ASB-CHL), severity 0.85, indigenous aquifer depletion & DLE reroute (SDG 12).
  - Endpoints: `GET /api/disruption/scenarios` and `POST /api/disruption/simulate/:scenarioKey`.
- **Recharts Portfolio Analytics (`GET /api/analytics/portfolio-breakdown/:orgId?`)**:
  - Formatted data feeds for Contributor B's dashboard:
    - **By Country**: spend, supplier count, and status breakdown.
    - **By Tier**: spend and at-risk spend across Tiers 0 to 4.
    - **ESG / SDG Compliance Index**: percentage and counts for ISO 14001, IRMA, SBTi Net-Zero, and RMI.
- **Gemini AI Structured Reasoning Service (`gemini.ts`)**:
  - Structured JSON model interaction for executive risk assessment and procurement switch memos with automated fallback fixtures for zero-latency demo guarantees.

---

## 3. System Architecture & Port Mapping

```text
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND COMMAND CENTER (Next.js App Router · Port 3000)               │
│ React Flow Canvas · WebGL Grid · Telemetry Top Bar · CRT Terminal Memo│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ NODE.JS EXPRESS BACKEND         │   │ PYTHON FASTAPI BACKEND          │
│ Port 5000                       │   │ Port 8000                       │
│ - TypeScript & Express          │   │ - FastAPI & Pydantic v2         │
│ - Zod Validation Middleware     │   │ - NetworkX Graph Intelligence   │
│ - Quote-Aware CSV Ingestion     │   │ - OpenAPI Docs (/docs)          │
│ - 16/16 Automated Tests Passing │   │ - 9/9 Pytest Tests Passing      │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │ Threaded Connection Pool
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ POSTGRESQL 18 RELATIONAL DATABASE (Port 5432 · veritassupply)          │
│ - Multi-tier suppliers (Tiers 0-4) with geospatial & SPOF flags       │
│ - Directional DAG edges (parent: downstream, child: upstream)          │
│ - Recursive CTEs with array path cycle protection                      │
│ - Disruption events, risk scores, alternate suppliers, mitigation memos│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete API Reference

Both servers (`http://localhost:5000` and `http://localhost:8000`) expose identical REST endpoints:

### 1. Health & Security Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "ONLINE",
  "database": "CONNECTED",
  "orgId": "00000000-0000-0000-0000-000000000001",
  "serverTime": "2026-09-11T10:15:34.000Z"
}
```

### 2. Supply Chain DAG (React Flow Format)
- **Endpoint**: `GET /api/supply-chain/:orgId`
- **Response**:
```json
{
  "organization": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Veritas Motors Corp",
    "industry": "Electric Vehicles & Clean Mobility"
  },
  "nodes": [
    {
      "id": "10000000-0000-0000-0000-000000000000",
      "name": "Veritas Assembly Gigafactory",
      "code": "VMC-USA",
      "country": "United States",
      "countryCode": "USA",
      "tier": 0,
      "materialCategory": "EV Final Assembly",
      "status": "NOMINAL",
      "riskScore": 0.05,
      "isSPOF": false,
      "spend": 450.0,
      "leadTimeDays": 0
    }
  ],
  "edges": [
    {
      "id": "...",
      "parentSupplierId": "10000000-0000-0000-0000-000000000000",
      "childSupplierId": "10000000-0000-0000-0000-000000000001",
      "componentName": "800V High-Voltage Battery Pack",
      "spendUsd": 180000000,
      "leadTimeDays": 21,
      "shippingRoute": "Transatlantic Air/Sea Corridor"
    }
  ]
}
```

### 3. Real-Time Telemetry & Portfolio Metrics
- **Endpoint**: `GET /api/risk-state/:orgId`
- **Usage**: Polled by frontend every 3–5 seconds.
- **Response**:
```json
{
  "orgId": "00000000-0000-0000-0000-000000000001",
  "timestamp": "2026-09-11T10:15:35.000Z",
  "nodes": [
    { "supplierId": "30000000-0000-0000-0000-000000000001", "status": "CRITICAL", "riskScore": 0.874, "isSPOF": true },
    { "supplierId": "20000000-0000-0000-0000-000000000001", "status": "ELEVATED", "riskScore": 0.6118, "isSPOF": true }
  ],
  "portfolioMetrics": {
    "totalSpendAtRiskUSD": 303000000,
    "avoidedScope3Tco2e": 1420.0,
    "activeDisruptionsCount": 1
  }
}
```

### 4. Trigger Disruption Simulation
- **Endpoint**: `POST /api/disruption/trigger`
- **Request Body** (optional — defaults to Red Sea Blockade):
```json
{
  "supplierId": "30000000-0000-0000-0000-000000000001",
  "type": "GEOPOLITICAL_BLOCKADE",
  "severity": 0.92,
  "sourceSummary": "Red Sea drone swarm attack near Bab-el-Mandeb strait."
}
```
- **Response**:
```json
{
  "eventId": "bd0797c7-e0e5-4808-b81d-b6fd9a3099a4",
  "supplierId": "30000000-0000-0000-0000-000000000001",
  "type": "GEOPOLITICAL_BLOCKADE",
  "severity": 0.92,
  "impactedNodesCount": 4,
  "impactedNodes": [
    { "supplier_id": "30000000-0000-0000-0000-000000000001", "propagated_risk": 0.874 },
    { "supplier_id": "20000000-0000-0000-0000-000000000001", "propagated_risk": 0.6118 },
    { "supplier_id": "10000000-0000-0000-0000-000000000001", "propagated_risk": 0.4283 },
    { "supplier_id": "10000000-0000-0000-0000-000000000000", "propagated_risk": 0.2998 }
  ]
}
```

### 5. Reset Disruption State
- **Endpoint**: `POST /api/disruption/reset/:orgId`
- **Response**:
```json
{
  "message": "[SYS_RESET] Supply chain returned to NOMINAL state."
}
```

### 6. Generate Autonomous Mitigation Memo
- **Endpoint**: `POST /api/mitigation/:supplierId`
- **Response**:
```json
{
  "id": "aee4efda-a0db-4421-a1e0-6af5701e60ce",
  "disruptedSupplierId": "30000000-0000-0000-0000-000000000001",
  "alternateSupplierId": "50000000-0000-0000-0000-000000000001",
  "alternateName": "Nordic Horn Maritime Lines",
  "priceVariancePct": 4.2,
  "leadTimeDeltaDays": -3,
  "avoidedScope3Tco2e": 1420.0,
  "complianceRationale": "Re-routing maritime transit away from Bab-el-Mandeb conflict corridor to Nordic Horn EU-monitored fleet. Upholds UN SDG 8 and SDG 12.",
  "executiveSummary": "======================================================================\nVERITAS SENTINEL // AUTONOMOUS PROCUREMENT DIRECTIVE [MEMO-409]\nSTATUS: ROUTE MITIGATION VALIDATED\n======================================================================\nTARGET COMPONENT:  Red Sea Shipping Chokepoint\nDISRUPTED NODE:    Apex Maritime Logistics [Djibouti / Yemen]\nRECOMMENDED ALT:   Nordic Horn Maritime Lines\n\nTRADE-OFF MATRIX:\n- Price Variance:         +4.2%\n- Lead Time Variance:     -3 days\n- Avoided Scope-3 Carbon: -1,420.0 tCO2e (SDG 12)\n- Labor Compliance:       AUDITED 100% CLEAN (SDG 8)\n======================================================================",
  "generatedAt": "2026-09-11T10:15:35.000Z"
}
```

### 7. Candidate Alternate Suppliers
- **Endpoint**: `GET /api/alternates/:supplierId`
- **Response**: Returns pre-vetted replacement carriers and suppliers with emissions factors and price indices.

### 8. Single Point of Failure (SPOF) Graph Analytics
- **Endpoint**: `GET /api/analytics/spofs/:orgId`
- **Response**:
```json
{
  "orgId": "00000000-0000-0000-0000-000000000001",
  "singlePointsOfFailure": [
    {
      "supplierId": "30000000-0000-0000-0000-000000000001",
      "name": "Apex Maritime Logistics",
      "tier": 3,
      "hazardType": "ARTICULATION_POINT_SPOF",
      "rationale": "Single Point of Failure: Removal of Apex Maritime Logistics disconnects upstream tiers from downstream manufacturing."
    }
  ],
  "bridgeEdges": [
    {
      "childSupplierId": "40000000-0000-0000-0000-000000000001",
      "childName": "Katanga Artisanal Ore",
      "parentSupplierId": "30000000-0000-0000-0000-000000000001",
      "parentName": "Apex Maritime Logistics",
      "component": "Concentrated Cobalt Ore",
      "rationale": "Single transit corridor: no alternate pathway exists between these nodes."
    }
  ]
}
```

### 9. BOM Ingestion (CSV or JSON)
- **Endpoint**: `POST /api/ingest`
- **Payload**: Multipart form-data `file: <sample-ev-battery-bom.csv>` or JSON `{ "lineItems": [...] }`.
- **Response**: Returns updated DAG with all nodes and linked edges.

### 10. Multi-Scenario Disruption Catalog (SDG 8 & SDG 12)
- **Endpoint**: `GET /api/disruption/scenarios`
- **Response**:
```json
{
  "scenarios": [
    {
      "key": "RED_SEA_BLOCKADE",
      "title": "Red Sea & Bab-el-Mandeb Maritime Chokepoint Blockade",
      "targetSupplierCode": "AML-YEM",
      "targetSupplierName": "Apex Maritime Logistics",
      "disruptionType": "GEOPOLITICAL_BLOCKADE",
      "severity": 0.92,
      "sdgAnchor": "SDG 8 (Decent Work & Maritime Crew Welfare) / SDG 12 (Avoided Scope-3 Emissions)",
      "narrative": "Houthi drone swarm and missile strikes near Bab-el-Mandeb strait force indefinite container bypass..."
    },
    {
      "key": "XINJIANG_UFLPA_SANCTIONS",
      "title": "Xinjiang Polysilicon Forced Labor Withhold Release Order (UFLPA)",
      "targetSupplierCode": "SRS-CHN",
      "targetSupplierName": "Sino-Refine Silicon Co",
      "disruptionType": "SANCTIONS_FORCED_LABOR",
      "severity": 0.88,
      "sdgAnchor": "SDG 8: Decent Work & Total Eradication of Forced Labor",
      "narrative": "US Customs and Border Protection (CBP) enforces immediate detention of polysilicon substrates..."
    },
    {
      "key": "DRC_COBALT_MORATORIUM",
      "title": "DRC Artisanal Cobalt Mine Moratorium & Child Labor Audit",
      "targetSupplierCode": "KAO-COD",
      "targetSupplierName": "Katanga Artisanal Ore",
      "disruptionType": "SANCTIONS_FORCED_LABOR",
      "severity": 0.95,
      "sdgAnchor": "SDG 8: Elimination of Hazardous Child Labor & Modern Slavery",
      "narrative": "Artisanal pit collapse and audit exposé in Katanga province triggers emergency export embargo..."
    },
    {
      "key": "ATACAMA_WATER_CRISIS",
      "title": "Atacama Basin Water Extraction Freeze & Aquifer Depletion",
      "targetSupplierCode": "ASB-CHL",
      "targetSupplierName": "Atacama Salt Brine Ltd",
      "disruptionType": "NATURAL_DISASTER",
      "severity": 0.85,
      "sdgAnchor": "SDG 12: Sustainable Consumption & Water Resource Protection",
      "narrative": "Chilean Environmental Court orders immediate 60-day cessation of brine pumping..."
    }
  ]
}
```

### 11. 1-Click Scenario Simulation
- **Endpoint**: `POST /api/disruption/simulate/:scenarioKey`
- **Example**: `POST /api/disruption/simulate/XINJIANG_UFLPA_SANCTIONS`
- **Response**: Triggers disruption and propagates upward risk attenuation with $0.7\times$ decay.

### 12. Execute Autonomous Reroute ([EXECUTE_REROUTE])
- **Endpoint**: `POST /api/mitigation/execute` (or `POST /api/mitigation/:memoId/execute`)
- **Payload**: `{ "memoId": "<uuid>" }`
- **Response**:
```json
{
  "success": true,
  "message": "Autonomous reroute executed: swapped Sino-Refine Silicon Co with certified alternate Patagonia Sustainable Inverter Silicon Wafers SpA. Supply chain DAG rewired and downstream assembly corridors restored to nominal status.",
  "memoId": "634f8a12-cb08-407a-8ae8-69c3b632daff",
  "previousSupplierId": "30000000-0000-0000-0000-000000000003",
  "previousSupplierName": "Sino-Refine Silicon Co",
  "newSupplierId": "b5ef40bc-1a89-423c-ae7b-e44cc1e9c7d8",
  "newSupplierName": "Patagonia Sustainable Inverter Silicon Wafers SpA",
  "avoidedScope3Tco2e": 350.0,
  "updatedDAG": { "nodes": [...], "edges": [...] }
}
```

### 13. Recharts Portfolio Breakdown Analytics
- **Endpoint**: `GET /api/analytics/portfolio-breakdown/:orgId?`
- **Response**:
```json
{
  "orgId": "00000000-0000-0000-0000-000000000001",
  "timestamp": "2026-09-11T12:00:00.000Z",
  "byCountry": [
    {
      "country": "United States",
      "countryCode": "USA",
      "spendUSD": 450000000,
      "supplierCount": 1,
      "atRiskSpendUSD": 0,
      "highestRiskScore": 0.05,
      "status": "NOMINAL"
    }
  ],
  "byTier": [
    {
      "tier": 0,
      "tierLabel": "Tier 0 (Assembly)",
      "spendUSD": 450000000,
      "supplierCount": 1,
      "atRiskSpendUSD": 0
    }
  ],
  "esgCompliance": {
    "totalSuppliers": 12,
    "certifiedSuppliersCount": 12,
    "compliancePercentage": 100,
    "laborStandardsCertifiedCount": 8,
    "environmentalCertifiedCount": 10
  }
}
```

---

## 5. Test Suite Verification

### Node.js Security & Edge-Case Suite (`npm test`): 16/16 Passed (100%)
```bash
cd backend
npm test
```
```text
  ✓ [PASS] 1. Healthcheck Endpoint & Security Headers -> Status: 200, Nosniff: nosniff
  ✓ [PASS] 2. SQL Injection in :orgId Parameter -> HTTP 400: INVALID_PARAMETER
  ✓ [PASS] 3. Malformed UUID in :orgId -> HTTP 400: INVALID_PARAMETER
  ✓ [PASS] 4. Non-Existent Organization UUID -> HTTP 404: NOT_FOUND
  ✓ [PASS] 5. Invalid Severity (>1.0) in /api/disruption/trigger -> HTTP 400: VALIDATION_FAILED
  ✓ [PASS] 6. Invalid Disruption Type in /api/disruption/trigger -> HTTP 400: VALIDATION_FAILED
  ✓ [PASS] 7. Non-Existent Supplier in Disruption Trigger -> HTTP 404: NOT_FOUND
  ✓ [PASS] 8. Non-Existent Supplier in /api/mitigation/:id -> HTTP 404: NOT_FOUND
  ✓ [PASS] 9. Simulate Red Sea Blockade & Verify 0.7x CTE Decay -> HTTP 200, Impacted 4 tiers
  ✓ [PASS] 10. Polled Risk State reflects elevated spend-at-risk -> Total Spend at Risk: $303.0M
  ✓ [PASS] 11. Autonomous Mitigation Memo Synthesis -> Alternate: Nordic Horn Maritime Lines
  ✓ [PASS] 12. Ingestion of Malformed CSV Data -> HTTP 400: INVALID_BOM_DATA
  ✓ [PASS] 13. Ingestion of Valid CSV with Quoted Commas -> HTTP 200: 1 suppliers, 1 edges linked
  ✓ [PASS] 14. Reset Disruption State to Nominal -> Reset confirmed. Spend: $0, Disruptions: 0
  ✓ [PASS] 15. Graph SPOF Hazard & Bottleneck Analytics -> HTTP 200: Found 2 SPOFs, 11 Bridges
  ✓ [PASS] 16. Candidate Alternate Suppliers for Red Sea Chokepoint -> HTTP 200: Found 3 alternates
```

### Node.js Contributor A Expansions Suite (`npm run test:expansions`): 5/5 Passed (100%)
```bash
cd backend
npm run test:expansions
```
```text
  ✓ PASS: Scenario catalog successfully retrieved (4 scenarios).
  ✓ PASS: Scenario simulation triggered and propagated 0.7x upward decay.
  ✓ PASS: Autonomous mitigation memo synthesized.
  ✓ PASS: Closed-loop autonomous reroute successfully updated graph edges.
  ✓ PASS: Recharts portfolio breakdown analytics formatted accurately.
```

### Python Pytest Suite (`npm run test:python`): 13/13 Passed (100%)
```bash
cd backend
npm run test:python
```
```text
python/tests/test_python_backend.py::test_health_check PASSED
python/tests/test_python_backend.py::test_get_supply_chain_dag PASSED
python/tests/test_python_backend.py::test_networkx_spof_analytics PASSED
python/tests/test_python_backend.py::test_simulate_red_sea_blockade_disruption PASSED
python/tests/test_python_backend.py::test_autonomous_mitigation_memo PASSED
python/tests/test_python_backend.py::test_reset_disruption PASSED
python/tests/test_python_backend.py::test_invalid_organization_404 PASSED
python/tests/test_python_backend.py::test_get_candidate_alternates PASSED
python/tests/test_python_backend.py::test_csv_bom_ingest PASSED
python/tests/test_python_backend.py::test_disruption_scenario_catalog PASSED
python/tests/test_python_backend.py::test_simulate_named_scenario PASSED
python/tests/test_python_backend.py::test_portfolio_analytics PASSED
python/tests/test_python_backend.py::test_execute_reroute_endpoint PASSED
======================== 13 passed in 1.53s ========================
```

---

## 6. Development & Run Commands

```bash
# 1. Start Node.js Express Server (Port 5000)
cd backend
npm run dev

# 2. Start Python FastAPI Server (Port 8000)
cd backend
npm run start:python

# 3. Re-run Database Schema & Seed (if needed)
psql -U postgres -h localhost -d veritassupply -f backend/db/schema.sql
psql -U postgres -h localhost -d veritassupply -f backend/db/seed.sql

# 4. Run All Automated Test Suites
npm test                 # Node.js 16/16 Security & Edge-Case Suite
npm run test:expansions  # Node.js 5/5 Contributor A Expansions Suite
npm run test:python      # Python 13/13 Pytest Suite
```
