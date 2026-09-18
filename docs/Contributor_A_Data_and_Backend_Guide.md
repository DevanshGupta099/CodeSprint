# VeritasSupply — Contributor A Data & Backend Guide

*Lead Architect: Devansh | Database, CTE Propagation, AI Sentinels & Seed Architecture*

---

## 1. Responsibilities Overview

As **Contributor A (Devansh)**, you own the core data engine and intelligence pipeline:

1. **Relational Schema & Database Migrations**: Supabase, Neon, or PostgreSQL.
2. **Recursive CTEs**:
   - Downward tree reconstruction: Rebuilding the full multi-tier DAG from flat edge records.
   - Upward risk propagation: Walking disruptions from Tier 4/3 up to finished goods with a `0.7` decay factor.
3. **Realistic Storytelling Seed Dataset**: High-fidelity supply chain archetypes (Chile lithium, Xinjiang silicon, DRC cobalt, Red Sea maritime bottleneck).
4. **BOM Ingestion Pipeline**: Native CSV/XLSX direct row parsing + AI-assisted PDF/invoice extraction.
5. **AI Agent Services**: Risk Scoring Sentinel & Autonomous Mitigation Engine using structured JSON and deterministic fallbacks.
6. **API Endpoints**: `/api/supply-chain/:orgId`, `/api/risk-state/:orgId`, `/api/disruption/trigger`, `/api/mitigation/:supplierId`.

---

## 2. Complete Database Schema (PostgreSQL)

```sql
-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tier-0 Enterprises)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Multi-tier Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    tier INT NOT NULL CHECK (tier >= 0 AND tier <= 4),
    material_category TEXT NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Supplier Edges (Directed Acyclic Graph)
-- parent_supplier_id = DOWNSTREAM consumer (closer to finished product)
-- child_supplier_id = UPSTREAM provider (supplies into parent)
CREATE TABLE supplier_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    child_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    spend_usd NUMERIC(15, 2) NOT NULL,
    lead_time_days INT NOT NULL,
    shipping_route TEXT,
    CONSTRAINT unique_edge UNIQUE (parent_supplier_id, child_supplier_id)
);

-- 4. Disruption Events Feed
CREATE TABLE disruption_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- GEOPOLITICAL_BLOCKADE | NATURAL_DISASTER | SANCTIONS_FORCED_LABOR | PORT_CLOSURE
    severity FLOAT NOT NULL CHECK (severity >= 0 AND severity <= 1),
    source_summary TEXT NOT NULL,
    source_url TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Risk Scores
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    probability FLOAT NOT NULL,
    severity FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    rationale TEXT NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Alternate Suppliers Registry
CREATE TABLE alternate_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    replaces_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    price_index FLOAT NOT NULL, -- 1.04 for +4% variance
    lead_time_days INT NOT NULL,
    emissions_factor FLOAT NOT NULL,
    certifications TEXT[] DEFAULT '{}'
);

-- 7. Procurement Mitigation Memos
CREATE TABLE mitigation_memos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disrupted_supplier_id UUID NOT NULL REFERENCES suppliers(id),
    alternate_supplier_id UUID NOT NULL REFERENCES alternate_suppliers(id),
    price_variance_pct FLOAT NOT NULL,
    lead_time_delta_days INT NOT NULL,
    avoided_scope3_tco2e FLOAT NOT NULL,
    compliance_rationale TEXT NOT NULL,
    summary TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Recursive CTE Algorithms

### A. Downward Tree Reconstruction

Reconstructs the hierarchical N-tier tree starting from the enterprise node:

```sql
WITH RECURSIVE bom_tree AS (
  SELECT 
    id, name, country, tier, material_category, 0 AS depth
  FROM suppliers 
  WHERE id = :root_supplier_id
  
  UNION ALL
  
  SELECT 
    s.id, s.name, s.country, s.tier, s.material_category, bt.depth + 1
  FROM suppliers s
  JOIN supplier_edges e ON e.child_supplier_id = s.id
  JOIN bom_tree bt ON bt.id = e.parent_supplier_id
)
SELECT * FROM bom_tree ORDER BY depth;
```

### B. Upward Risk Propagation with Attenuation

When a Tier-4/3 supplier encounters a disruption, risk climbs upward to its downstream consumers, decaying by 30% (`* 0.7`) per tier hop:

```sql
WITH RECURSIVE risk_up AS (
  -- Seed anchor: disrupted supplier
  SELECT 
    supplier_id, 
    probability, 
    severity, 
    1.0 AS decay,
    (probability * severity) AS current_impact
  FROM risk_scores 
  WHERE supplier_id = :disrupted_supplier_id
  
  UNION ALL
  
  -- Recurse up from child to parent
  SELECT 
    e.parent_supplier_id AS supplier_id,
    r.probability,
    r.severity,
    r.decay * 0.7 AS decay,
    (r.probability * r.severity * (r.decay * 0.7)) AS current_impact
  FROM supplier_edges e
  JOIN risk_up r ON r.supplier_id = e.child_supplier_id
)
SELECT 
  supplier_id, 
  ROUND(MAX(current_impact)::numeric, 3) AS propagated_risk_score
FROM risk_up 
GROUP BY supplier_id;
```

---

## 4. Realistic Seed Dataset Archetypes

To power an unforgettable demo, seed data maps directly to real-world disruption scenarios:

| Node Name | Tier | Country | Role / Story Archetype |
| :--- | :--- | :--- | :--- |
| **Veritas Motors Corp** | Tier 0 | USA | Finished EV Automobile Assembler |
| **Apex Power Systems** | Tier 1 | Germany | High-voltage battery pack manufacturer |
| **Voltaic Cell Dynamics** | Tier 2 | South Korea | Lithium-ion battery cell fabricator |
| **Sino-Refine Silicon Co.** | Tier 3 | China (Xinjiang) | Silicon wafer smelter (sanction archetype) |
| **Atacama Salt Brine Ltd.** | Tier 3 | Chile | Primary lithium brine refiner (flood archetype) |
| **Apex Logistics Maritime** | Tier 3 | Yemen / Djibouti | Bab-el-Mandeb maritime transport (Red Sea blockade) |
| **Katanga Artisanal Ore** | Tier 4 | DR Congo | Raw cobalt mining extraction (labor compliance archetype) |

---

## 5. AI Agent Prompt Specifications

### 1. Risk Scoring Agent

```typescript
const prompt = `
You are the VeritasSupply Risk Sentinel Agent.
Analyze the following disruption event against the supplier metadata:
Supplier: ${supplier.name} (${supplier.country}, Tier ${supplier.tier}, Category: ${supplier.materialCategory})
Event: ${event.type} - ${event.sourceSummary}

Evaluate the supply chain risk. Respond ONLY with valid JSON matching:
{
  "probability": number (0.0 to 1.0),
  "severity": number (0.0 to 1.0),
  "confidence": number (0.0 to 1.0),
  "rationale": string (concise 2-sentence rationale)
}
`;
```

### 2. Autonomous Mitigation Engine

```typescript
const prompt = `
You are the VeritasSupply Autonomous Mitigation Agent.
The primary supplier ${disruptedSupplier.name} (${disruptedSupplier.country}) is CRITICAL due to: ${event.sourceSummary}.
Review the candidate alternates:
${JSON.stringify(candidateAlternates, null, 2)}

Select the optimal replacement prioritizing compliance, lead time, and Scope-3 emissions reduction.
Respond ONLY with valid JSON matching:
{
  "recommendedAlternateId": string,
  "priceVariancePct": number,
  "leadTimeDeltaDays": number,
  "avoidedScope3Tco2e": number,
  "complianceRationale": string,
  "executiveSummary": string
}
`;
```

### 3. Multi-Provider Cascading Failover Flow
The system queries providers sequentially, failing over seamlessly on rate limits (`429`) or timeouts:
1. **Primary**: **Mistral AI** (`codestral-latest`, `ministral-8b-latest`) — ~2.3s latency, excellent structured code & JSON adherence.
2. **High-Speed LPU**: **Groq** (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) — sub-second ~210ms–980ms execution.
3. **Deep Reasoning**: **Google Gemini** (`gemini-3.5-flash-lite`, `gemini-3.6-flash`) — ~2.6s reasoning.
4. **Deterministic Fallback**: Offline PostgreSQL CTE and seed graph fixtures (<1ms) guarantees 100% demo uptime without blank screens.

---

## 6. API Route Handlers

- `GET /api/supply-chain/:orgId`: Returns `{ nodes, edges }` formatted for direct React Flow consumption.
- `GET /api/risk-state/:orgId`: Returns current risk scores and status (`NOMINAL`, `ELEVATED`, `CRITICAL`) for every supplier node. Polled by frontend every 3–5 seconds.
- `POST /api/disruption/trigger`: Manually or automatically activates a disruption event against a node.
- `POST /api/mitigation/:supplierId`: Generates an autonomous Procurement Switch Memo.
- `GET /api/analytics/spofs/:orgId`: NetworkX graph analytics detecting cut vertices (SPOFs), bridges, and betweenness centrality.

---

## 7. Python Intelligence Stack (FastAPI + NetworkX + Pydantic v2)

For advanced mathematical graph analytics and low-latency algorithmic risk modeling, a dedicated Python engine is available under `backend/python/`:

- **Framework**: FastAPI with automatic interactive documentation (`http://localhost:8000/docs`).
- **Graph Analytics Engine**: NetworkX `DiGraph` analysis:
  - Articulation points / Cut vertices: true Single Points of Failure whose failure disconnects upstream raw materials from downstream assembly.
  - Bridge edges: single transit corridors without alternate routing.
  - Betweenness Centrality: identifying structural supply bottlenecks.
- **Data Validation**: Strict Pydantic v2 models mirroring `types/supply-chain.ts`.
- **Database Access**: Threaded connection pool against PostgreSQL using recursive CTE queries.
- **AI Synthesis**: Asynchronous multi-provider LLM cascade with `httpx` in `backend/python/app/services/ai_engine.py`.

---

## 8. Enterprise Security Architecture

- **Sliding-Window IP Rate Limiting**:
  - 120 req/min for read routes (`/api/supply-chain`, `/api/health`, `/api/risk-state`).
  - 30 req/min for AI generation & mutation endpoints (`/api/disruption/trigger`, `/api/mitigation/*`).
- **OWASP Security Headers**:
  - HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`).
  - `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Input Sanitization**:
  - Regex verification (`^[A-Z0-9_]{1,64}$`) for route preset IDs.
  - UUID format validation before SQL queries.
  - 1,500 character ceiling on user prompts.
- **Dynamic CORS**:
  - Restricts requests to `https://veritas-supply.vercel.app`, Vercel previews (`*.vercel.app`), and local development.

---

## 9. Development & Testing Commands

### Node.js / TypeScript Backend (Port 5000)
```bash
cd backend
npm install
npm run dev                # Start Express dev server on port 5000
npm test                   # Run automated security & API suite (16/16 tests)
```

### Python FastAPI Intelligence Backend (Port 8000)
```bash
# Set up virtual environment
python -m venv backend/.venv
backend/.venv/Scripts/pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python backend/python/run_server.py
# Or via npm shortcut in backend/:
npm run start:python

# Run Pytest suite (9/9 tests)
npm run test:python
# Or directly:
backend/.venv/Scripts/pytest backend/python/tests/test_python_backend.py -v
```

