# VeritasSupply — Backend Architecture & Progress Report

**Contributor A (Lead Data & Backend)**: Devansh  
**Project**: Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine  
**Status**: Core Backend 100% Operational & Verified  
**Date**: September 11, 2026  

---

## 1. Executive Summary

VeritasSupply is engineered to address the critical vulnerability in global enterprise manufacturing: **visibility beyond Tier-1 suppliers down to Tier-4 raw material nodes**.

In a traditional supply chain, original equipment manufacturers (OEMs) only communicate with their direct Tier-1 assembly partners. Upstream shocks — such as a maritime blockade at the Bab-el-Mandeb strait, forced-labor sanctions in Xinjiang, or mining disruptions in the Katanga cobalt belt — remain entirely hidden until Tier-1 assembly lines abruptly stall.

The backend provides the complete computational intelligence backbone:
1. **BOM Ingestion**: Ingests bills of materials, validates line items, and constructs the relational supplier graph.
2. **PostgreSQL Recursive CTE Graph Reconstruction**: Automatically reconstructs the full multi-tier DAG from Tier 0 to Tier 4 in exact depth order.
3. **Disruption Sentinel Engine**: Simulates geopolitical and environmental shocks and computes upward risk attenuation ($0.7\times$ decay factor per hop) up the DAG.
4. **Autonomous Mitigation Engine**: Selects optimal pre-qualified replacement suppliers, calculates price and lead time deltas, and computes avoided Scope-3 carbon emissions (**UN SDG 12**) and labor compliance (**UN SDG 8**), outputting an executive CRT terminal typewriter memorandum.
5. **Graph SPOF Intelligence**: Computes NetworkX articulation points (Single Points of Failure), critical bridge corridors, and betweenness centrality.

---

## 2. Comprehensive Progress Log (Everything Built)

### Milestone 1: PostgreSQL Relational Schema & Storytelling Seed
- Configured PostgreSQL 18 with UUID generation (`uuid-ossp`).
- Built DDL schema ([`backend/db/schema.sql`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/db/schema.sql)):
  - `organizations`: Enterprise Tier-0 manufacturer (`Veritas Motors Corp`).
  - `suppliers`: Nodes across Tiers 0 through 4 with geocoordinates, spend, lead times, certifications, status (`NOMINAL`, `ELEVATED`, `CRITICAL`), and `is_spof` flags.
  - `supplier_edges`: Directional dependencies (`parent_supplier_id`: downstream consumer, `child_supplier_id`: upstream supplier).
  - `disruption_events`: Incident feed tracking incident types, severity, and sources.
  - `risk_scores`: Quantitative probability, severity, confidence, and audit rationale.
  - `alternate_suppliers`: Pre-vetted alternatives with price indices, lead times, and carbon emission factors.
  - `mitigation_memos`: Saved mitigation directives and CRT typewriter text.
- Seeded the canonical EV battery archetype ([`backend/db/seed.sql`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/db/seed.sql)):
  - **Tier 0**: `Veritas Assembly Gigafactory` (USA)
  - **Tier 1**: `Apex Power Systems GmbH` (Germany), `DriveTech Inverters Ltd` (Japan)
  - **Tier 2**: `Voltaic Cell Dynamics` (South Korea), `Munich BMS Modules` (Germany), `Kobe Precision Copper` (Japan)
  - **Tier 3**: `Apex Maritime Logistics` (Djibouti/Yemen - Red Sea Chokepoint **SPOF**), `Atacama Salt Brine Ltd` (Chile), `Sino-Refine Silicon Co` (China)
  - **Tier 4**: `Katanga Artisanal Ore` (DR Congo - Cobalt **SPOF**), `Pilbara Spodumene Corp` (Australia)
  - **Alternates**: `Nordic Horn Maritime Lines` (Norway - Cape route alternate carrier).

### Milestone 2: Recursive CTE Algorithms
- **Downward Reconstruction (`bom_tree`)**: Recursively navigates parent $\rightarrow$ child links to output all nodes ordered by hierarchical tier depth.
- **Upward Propagation with $0.7\times$ Attenuation (`risk_up`)**:
  - Implemented the decay formula:
    $$\text{Impact}_{\text{hop}} = \text{Probability} \times \text{Severity} \times (0.7)^{\text{depth}}$$
  - **Cycle-Protection Hardening**: Engineered array path tracking (`ARRAY[$1::uuid] AS path` and `WHERE NOT (e.parent_supplier_id = ANY(r.path))`), preventing infinite loops on circular or messy graph data.
  - Automatically updates `suppliers.risk_score` and `suppliers.status` (`NOMINAL` $< 0.35 \le$ `ELEVATED` $< 0.70 \le$ `CRITICAL`).

### Milestone 3: Dual-Backend Implementation
- **Node.js Express Backend** ([`backend/src/server.ts`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/src/server.ts)):
  - Built with TypeScript and Express on port `5000`.
  - Hardened with RFC 4122 UUID validation middleware, Zod payload schemas, and 10MB upload limits.
- **Python FastAPI Intelligence Engine** ([`backend/python/app/main.py`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/python/app/main.py)):
  - Built with FastAPI, Pydantic v2, and NetworkX on port `8000`.
  - Exposes interactive OpenAPI documentation at `http://localhost:8000/docs`.
  - Computes articulation points (cut vertices) and bridge edges for graph hazard badges.

### Milestone 4: Ingestion Pipeline & Demo BOM
- Implemented quote-aware CSV parser capable of handling nested commas within quotes.
- Row-by-row Zod schema validation (`BOMLineItemSchema`).
- Ingestion endpoint `POST /api/ingest` creates suppliers and links edges dynamically in PostgreSQL.
- Packaged realistic demo dataset: [`data/sample-ev-battery-bom.csv`](file:///c:/Users/Devansh/Downloads/CodeSprint/data/sample-ev-battery-bom.csv).

### Milestone 5: Security & Bug Hardening
- **SQL Injection Defense**: Replaced raw string interpolation with parameterized queries across all database drivers (`$1, $2` in Node.js, `%s` in Python).
- **UUID Validation**: Added pre-route UUID verification blocking injection vectors (`' OR '1'='1'`) before queries reach PostgreSQL.
- **Org-Scoped Telemetry**: Scoped avoided emissions and active disruption counts strictly to `org_id` to eliminate multi-tenant telemetry leaks.
- **Disruption Reset Cleanup**: Enhanced `resetRiskState` to delete active disruption records so `activeDisruptionsCount` returns cleanly to `0` upon demo reset.
- **HTTP Security Headers**: Injected `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and disabled `X-Powered-By`.

### Milestone 6: Automated Test Verification
- **Node.js Security & Edge Case Suite**: **16/16 Passed (100%)** via `npm test`.
- **Python Pytest Suite**: **9/9 Passed (100%)** via `npm run test:python`.

### Milestone 7: Configuration & Environment Templates
- Generated complete `.env.example` templates:
  - Root: [`.env.example`](file:///c:/Users/Devansh/Downloads/CodeSprint/.env.example)
  - Backend: [`backend/.env.example`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/.env.example)
  - Frontend: [`frontend/.env.example`](file:///c:/Users/Devansh/Downloads/CodeSprint/frontend/.env.example)

### Milestone 8: Multi-Provider AI Cascading Architecture
- **Primary AI Provider**: Mistral AI (`codestral-latest`, `ministral-8b-latest`) benchmarked live at ~2.3s latency with 100% strict JSON schema conformity.
- **High-Speed LPU Fallback**: Groq (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) delivering sub-second (~210ms–980ms) inference when primary hits demand spikes.
- **Deep Reasoning Fallback**: Google Gemini (`gemini-3.5-flash-lite`, `gemini-3.6-flash`) for multi-step structured synthesis.
- **Deterministic Knowledge Graph Fallback**: Hardcoded offline Postgres CTE and seed archetypes ensuring 100% demo resilience with zero crash risk under quota exhaustion.
- **Python Backend Parallel Integration**: Implemented async cascading failover in [`backend/python/app/services/ai_engine.py`](file:///c:/Users/Devansh/Downloads/CodeSprint/backend/python/app/services/ai_engine.py) using `httpx`.

### Milestone 9: OWASP Enterprise Security & Denial-of-Wallet Hardening
- **Sliding-Window IP Rate Limiter**:
  - General telemetry/read: 120 req/minute.
  - Sensitive AI/mutations: 30 req/minute with automated garbage collection.
- **OWASP Headers**: HSTS (`max-age=31536000`), `nosniff`, `DENY` clickjacking frame, `strict-origin-when-cross-origin`, and restricted `Permissions-Policy`.
- **Dynamic CORS**: Whitelists `https://veritas-supply.vercel.app`, Vercel previews (`*.vercel.app`), and local development environments.
- **Input Sanitization**: Regex parameter guards (`^[A-Z0-9_]{1,64}$`), UUID validators, 1,500-character prompt limits, and control-character stripping.
- **Sanitized Errors**: Internal database schemas and stack traces are masked in production responses.

---

## 3. Verified API Surface

Both **Port 5000 (Node.js)** and **Port 8000 (Python FastAPI)** provide identical API interfaces:

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service healthcheck & security headers |
| `GET` | `/api/supply-chain/:orgId` | Full DAG payload formatted for React Flow |
| `GET` | `/api/risk-state/:orgId` | Polled telemetry endpoint (node status & spend-at-risk) |
| `POST` | `/api/disruption/trigger` | Triggers disruption (e.g., Red Sea blockade) & propagates risk |
| `POST` | `/api/disruption/reset/:orgId` | Resets supply chain state to nominal for live demo replay |
| `POST` | `/api/mitigation/:supplierId` | Generates Zod-validated Procurement Switch Memo |
| `GET` | `/api/alternates/:supplierId` | Retrieves candidate alternate suppliers |
| `GET` | `/api/analytics/spofs/:orgId` | Graph SPOF hazard & bottleneck analytics |
| `POST` | `/api/ingest` | Ingests CSV or JSON BOM line items |

---

## 4. How to Run and Test

```bash
# 1. Start Node.js Express Server (Port 5000)
cd backend
npm run dev

# 2. Start Python FastAPI Server (Port 8000)
cd backend
npm run start:python

# 3. Run Node.js Automated Test Suite (16/16 Passing)
npm test

# 4. Run Python Pytest Suite (9/9 Passing)
npm run test:python
```
