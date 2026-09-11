-- VeritasSupply Database Schema (PostgreSQL)
-- Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tier-0 Enterprises)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Multi-tier Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    tier INT NOT NULL CHECK (tier >= 0 AND tier <= 4),
    material_category TEXT NOT NULL,
    certifications TEXT[] DEFAULT '{}',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    spend NUMERIC(15, 2) NOT NULL DEFAULT 0.0, -- Spend in Millions USD
    lead_time_days INT NOT NULL DEFAULT 14,
    status TEXT NOT NULL DEFAULT 'NOMINAL' CHECK (status IN ('NOMINAL', 'ELEVATED', 'CRITICAL')),
    risk_score FLOAT NOT NULL DEFAULT 0.0 CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    is_spof BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Supplier Edges (Directed Acyclic Graph)
-- parent_supplier_id = DOWNSTREAM consumer (closer to finished product / Tier 0)
-- child_supplier_id = UPSTREAM source (supplies component or raw material into parent)
CREATE TABLE IF NOT EXISTS supplier_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    child_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    spend_usd NUMERIC(15, 2) NOT NULL,
    lead_time_days INT NOT NULL,
    shipping_route TEXT,
    CONSTRAINT unique_supplier_edge UNIQUE (parent_supplier_id, child_supplier_id)
);

-- 4. Disruption Events Feed
CREATE TABLE IF NOT EXISTS disruption_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('GEOPOLITICAL_BLOCKADE', 'NATURAL_DISASTER', 'SANCTIONS_FORCED_LABOR', 'PORT_CLOSURE')),
    severity FLOAT NOT NULL CHECK (severity >= 0.0 AND severity <= 1.0),
    source_summary TEXT NOT NULL,
    source_url TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Risk Scores (Computed by Sentinel / CTE)
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    probability FLOAT NOT NULL CHECK (probability >= 0.0 AND probability <= 1.0),
    severity FLOAT NOT NULL CHECK (severity >= 0.0 AND severity <= 1.0),
    confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    rationale TEXT NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Alternate Suppliers Registry
CREATE TABLE IF NOT EXISTS alternate_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    replaces_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    price_index FLOAT NOT NULL, -- e.g. 1.042 for +4.2%
    lead_time_days INT NOT NULL,
    emissions_factor FLOAT NOT NULL, -- kg CO2e per unit
    certifications TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Procurement Mitigation Memos
CREATE TABLE IF NOT EXISTS mitigation_memos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disrupted_supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    alternate_supplier_id UUID NOT NULL REFERENCES alternate_suppliers(id) ON DELETE CASCADE,
    alternate_name TEXT NOT NULL,
    price_variance_pct FLOAT NOT NULL,
    lead_time_delta_days INT NOT NULL,
    avoided_scope3_tco2e FLOAT NOT NULL,
    compliance_rationale TEXT NOT NULL,
    summary TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rapid CTE traversal
CREATE INDEX IF NOT EXISTS idx_supplier_edges_parent ON supplier_edges(parent_supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_edges_child ON supplier_edges(child_supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org_id ON suppliers(org_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tier ON suppliers(tier);
CREATE INDEX IF NOT EXISTS idx_disruption_events_supplier ON disruption_events(supplier_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_supplier ON risk_scores(supplier_id);
