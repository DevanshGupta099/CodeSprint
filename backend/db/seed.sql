-- VeritasSupply Seed Data (PostgreSQL)
-- Realistic EV Supply Chain: Veritas Motors Corp (Tier 0 to Tier 4)

-- Clean existing data
TRUNCATE TABLE mitigation_memos CASCADE;
TRUNCATE TABLE alternate_suppliers CASCADE;
TRUNCATE TABLE risk_scores CASCADE;
TRUNCATE TABLE disruption_events CASCADE;
TRUNCATE TABLE supplier_edges CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- 1. Organization (Tier 0 Enterprise)
INSERT INTO organizations (id, name, industry) VALUES 
('00000000-0000-0000-0000-000000000001', 'Veritas Motors Corp', 'Electric Vehicles & Clean Mobility');

-- 2. Multi-tier Suppliers
INSERT INTO suppliers (id, org_id, name, code, country, country_code, tier, material_category, certifications, lat, lng, spend, lead_time_days, status, risk_score, is_spof) VALUES
-- Tier 0
('10000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 
 'Veritas Assembly Gigafactory', 'VMC-USA', 'United States', 'USA', 0, 'EV Final Assembly', 
 ARRAY['ISO 9001', 'ISO 14001', 'IATF 16949'], 37.7749, -122.4194, 450.00, 0, 'NOMINAL', 0.05, FALSE),

-- Tier 1
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
 'Apex Power Systems GmbH', 'APS-DEU', 'Germany', 'DEU', 1, 'High-Voltage Battery Packs', 
 ARRAY['ISO 9001', 'IATF 16949', 'ISO 26262'], 52.5200, 13.4050, 180.00, 21, 'NOMINAL', 0.08, FALSE),

('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
 'DriveTech Inverters Ltd', 'DTI-JPN', 'Japan', 'JPN', 1, 'SiC Power Inverters', 
 ARRAY['ISO 9001', 'IATF 16949'], 35.6762, 139.6503, 85.00, 28, 'NOMINAL', 0.07, FALSE),

-- Tier 2
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
 'Voltaic Cell Dynamics', 'VCD-KOR', 'South Korea', 'KOR', 2, 'NMC 811 Battery Cells', 
 ARRAY['ISO 9001', 'UL 1642', 'ISO 14001'], 37.5665, 126.9780, 95.00, 35, 'NOMINAL', 0.12, FALSE),

('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
 'Munich BMS Modules', 'MBM-DEU', 'Germany', 'DEU', 2, 'Battery Management PCBs', 
 ARRAY['ISO 9001', 'IPC-A-610'], 48.1351, 11.5820, 40.00, 18, 'NOMINAL', 0.06, FALSE),

('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 
 'Kobe Precision Copper', 'KPC-JPN', 'Japan', 'JPN', 2, 'Ultra-Thin Anode Foils', 
 ARRAY['ISO 9001', 'ISO 14001'], 34.6901, 135.1955, 32.00, 24, 'NOMINAL', 0.09, FALSE),

-- Tier 3 (SPOF chokepoint)
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
 'Apex Maritime Logistics', 'AML-YEM', 'Djibouti / Yemen', 'DJI', 3, 'Red Sea Shipping Chokepoint', 
 ARRAY['ISO 28000', 'BIMCO'], 12.5900, 43.3200, 28.00, 42, 'NOMINAL', 0.15, TRUE),

('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
 'Atacama Salt Brine Ltd', 'ASB-CHL', 'Chile', 'CHL', 3, 'Refined Lithium Hydroxide', 
 ARRAY['IRMA Verified', 'ISO 14001'], -23.8634, -67.1420, 48.00, 45, 'NOMINAL', 0.14, FALSE),

('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 
 'Sino-Refine Silicon Co', 'SRS-CHN', 'China', 'CHN', 3, 'Inverter Silicon Wafers', 
 ARRAY['ISO 9001'], 43.8256, 87.6168, 22.00, 38, 'NOMINAL', 0.18, FALSE),

-- Tier 4
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
 'Katanga Artisanal Ore', 'KAO-COD', 'DR Congo', 'COD', 4, 'Raw Cobalt Hydroxide', 
 ARRAY['RMI Cobalt Participant'], -11.6609, 27.4794, 18.00, 60, 'NOMINAL', 0.20, TRUE),

('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
 'Pilbara Spodumene Corp', 'PSC-AUS', 'Australia', 'AUS', 4, 'Raw Spodumene Hard-Rock', 
 ARRAY['ISO 14001', 'Towards Sustainable Mining'], -21.2858, 119.5080, 35.00, 50, 'NOMINAL', 0.11, FALSE);

-- 3. Supplier Edges (DAG: parent = downstream, child = upstream)
INSERT INTO supplier_edges (parent_supplier_id, child_supplier_id, component_name, spend_usd, lead_time_days, shipping_route) VALUES
-- Tier 0 <- Tier 1
('10000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', '800V High-Voltage Battery Pack', 180000000.00, 21, 'Transatlantic North Route'),
('10000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'Dual-Motor SiC Inverter', 85000000.00, 28, 'Transpacific Direct Lane'),

-- Tier 1 <- Tier 2
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'NMC 811 Pouch Battery Cells', 95000000.00, 35, 'Eurasian Maritime Corridor'),
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Safety Architecture BMS PCB', 40000000.00, 18, 'Central Europe Freight Rail'),
('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Rolled Annealed Copper Foil', 32000000.00, 24, 'Japan-Korea Shipping'),

-- Tier 2 <- Tier 3
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Raw Material Maritime Freight', 28000000.00, 42, 'BAB_EL_MANDEB_STRAIT'),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Battery-Grade Lithium Hydroxide', 48000000.00, 45, 'Pan-Pacific Mineral Route'),
('10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'Polysilicon Substrate Ingots', 22000000.00, 38, 'Silk Road Overland Freight'),

-- Tier 3 <- Tier 4
('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Concentrated Cobalt Ore', 18000000.00, 60, 'East African Mining Corridor'),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Spodumene Mineral Ore', 35000000.00, 50, 'Indian Ocean Transit');

-- 4. Initial Nominal Risk Scores
INSERT INTO risk_scores (supplier_id, probability, severity, confidence, rationale)
SELECT id, risk_score, 0.20, 0.90, 'Nominal baseline operational parameters. No active geopolitical or environmental disruptions.'
FROM suppliers;

-- 5. Alternate Suppliers (for Apex Maritime Logistics - Bab-el-Mandeb chokepoint)
INSERT INTO alternate_suppliers (id, replaces_supplier_id, name, country, country_code, price_index, lead_time_days, emissions_factor, certifications) VALUES
('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 
 'Nordic Horn Maritime Lines', 'Norway', 'NOR', 1.042, 39, 0.72, 
 ARRAY['IMO 2020 Clean Fuel Compliant', 'SBTi Verified Net-Zero', 'Green Marine EU']),

('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 
 'Pacific Direct Bulk Carrier', 'Singapore', 'SGP', 1.085, 46, 0.95, 
 ARRAY['BIMCO Certified', 'ISO 14001']),

('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 
 'Trans-Sahara Multimodal Freight', 'Morocco', 'MAR', 1.120, 48, 1.10, 
 ARRAY['ISO 9001', 'African Logistics Union']);
