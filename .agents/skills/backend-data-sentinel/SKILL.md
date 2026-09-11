---
name: backend-data-sentinel
description: >-
  Implementation guide and technical runbook for Contributor A (Devansh) on VeritasSupply.
  Covers PostgreSQL schema, recursive CTEs (downward DAG reconstruction and upward risk
  propagation with decay), BOM ingestion engine, AI Disruption Sentinel & Mitigation Engine
  agents, and realistic seed data archetypes.
---

# Backend & Data Sentinel Workflow (Contributor A - Devansh)

This skill provides the complete backend implementation guide, SQL migrations, recursive CTE queries, and AI prompt engineering for **VeritasSupply**.

---

## 1. PostgreSQL Schema & DDL

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Tier 0 Enterprise)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers across Tier 0 to Tier 4
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    tier INT NOT NULL CHECK (tier >= 0 AND tier <= 4),
    material_category TEXT NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DAG Edges (parent = downstream consumer, child = upstream provider)
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

-- Disruption Events
CREATE TABLE disruption_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- GEOPOLITICAL_BLOCKADE | NATURAL_DISASTER | SANCTIONS_FORCED_LABOR | PORT_CLOSURE
    severity FLOAT NOT NULL CHECK (severity >= 0 AND severity <= 1),
    source_summary TEXT NOT NULL,
    source_url TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Computed Risk Scores
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    probability FLOAT NOT NULL,
    severity FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    rationale TEXT NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alternate Suppliers Registry
CREATE TABLE alternate_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    replaces_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    price_index FLOAT NOT NULL, -- e.g. 1.04 for +4%
    lead_time_days INT NOT NULL,
    emissions_factor FLOAT NOT NULL, -- kg CO2e per unit
    certifications TEXT[] DEFAULT '{}'
);

-- Generated Mitigation Memos
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

## 2. Core Recursive CTE Algorithms

### 1. Tree Reconstruction (Root Downward to Children)
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

### 2. Risk Propagation (Disrupted Upstream Node Upward to Downstream Consumers with 0.7 Decay)
```sql
WITH RECURSIVE risk_up AS (
  -- Anchor: the directly disrupted supplier
  SELECT 
    supplier_id, 
    probability, 
    severity, 
    1.0 AS decay,
    (probability * severity) AS current_impact
  FROM risk_scores 
  WHERE supplier_id = :disrupted_supplier_id
  
  UNION ALL
  
  -- Recursive step: climb from child to parent
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

## 3. The 3 AI Agent Implementations (Structured JSON)

### Extraction Agent
- Input: Raw text from uploaded CSV/invoice/PDF.
- System Prompt: "You are an autonomous supply chain data extraction agent. Extract structured BOM line items. Always respond with strict JSON."
- Fallback: Deterministic 4-tier EV battery BOM fixture.

### Risk Scoring Agent
- Input: Disruption event metadata (`type: GEOPOLITICAL_BLOCKADE`, `region: Red Sea / Bab-el-Mandeb`, `supplier: Apex Logistics Maritime`).
- Prompt: Compute probability, severity, confidence, and 2-sentence rationale. Low temperature (0.1).

### Mitigation Engine Agent
- Input: Disrupted supplier (`Apex Logistics Maritime`) + candidate alternates (`Nordic Horn Maritime`, `Trans-Pacific Pacific Line`).
- Prompt: Rank candidate alternates by price variance, lead time delta, and avoided Scope-3 emissions. Synthesize executive Procurement Switch Memo.
