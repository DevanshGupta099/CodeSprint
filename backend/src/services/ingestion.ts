import { query } from '../db/index.js';
import { getSupplyChainDAG } from '../db/queries.js';

export interface BOMLineItem {
  supplierName: string;
  code: string;
  country: string;
  countryCode: string;
  tier: number;
  materialCategory: string;
  componentName: string;
  spendUsd: number;
  leadTimeDays: number;
  parentSupplierCode: string;
  shippingRoute?: string;
  lat?: number;
  lng?: number;
}

/**
 * Parses a simple CSV text containing BOM line items
 */
export function parseBOMCSV(csvText: string): BOMLineItem[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const items: BOMLineItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < headers.length) continue;

    items.push({
      supplierName: cols[0] || 'Unknown Supplier',
      code: cols[1] || `SUP-${i}`,
      country: cols[2] || 'Global',
      countryCode: cols[3] || 'GLB',
      tier: parseInt(cols[4] || '1', 10),
      materialCategory: cols[5] || 'General Component',
      componentName: cols[6] || 'Raw Sub-component',
      spendUsd: parseFloat(cols[7] || '1000000'),
      leadTimeDays: parseInt(cols[8] || '20', 10),
      parentSupplierCode: cols[9] || 'VMC-USA',
      shippingRoute: cols[10] || 'Standard Freight',
      lat: cols[11] ? parseFloat(cols[11]) : undefined,
      lng: cols[12] ? parseFloat(cols[12]) : undefined,
    });
  }

  return items;
}

/**
 * Ingests BOM line items into database and links edges
 */
export async function ingestBOMItems(orgId: string, items: BOMLineItem[]) {
  const codeToIdMap = new Map<string, string>();

  // 1. Fetch existing suppliers for code lookup
  const existingSuppliers = await query('SELECT id, code FROM suppliers WHERE org_id = $1', [orgId]);
  for (const row of existingSuppliers.rows) {
    codeToIdMap.set(row.code, row.id);
  }

  // 2. Insert or update suppliers
  for (const item of items) {
    let supplierId = codeToIdMap.get(item.code);
    if (!supplierId) {
      const ins = await query(
        `INSERT INTO suppliers (
          org_id, name, code, country, country_code, tier, material_category,
          spend, lead_time_days, lat, lng
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (code) DO UPDATE SET 
          spend = EXCLUDED.spend,
          lead_time_days = EXCLUDED.lead_time_days
        RETURNING id`,
        [
          orgId,
          item.supplierName,
          item.code,
          item.country,
          item.countryCode,
          item.tier,
          item.materialCategory,
          item.spendUsd / 1000000, // Millions
          item.leadTimeDays,
          item.lat || 0,
          item.lng || 0,
        ]
      );
      supplierId = ins.rows[0].id;
      codeToIdMap.set(item.code, supplierId!);
    }
  }

  // 3. Insert edges
  for (const item of items) {
    const childId = codeToIdMap.get(item.code);
    const parentId = codeToIdMap.get(item.parentSupplierCode);

    if (childId && parentId && childId !== parentId) {
      await query(
        `INSERT INTO supplier_edges (
          parent_supplier_id, child_supplier_id, component_name, spend_usd, lead_time_days, shipping_route
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (parent_supplier_id, child_supplier_id) DO UPDATE SET 
          spend_usd = EXCLUDED.spend_usd,
          lead_time_days = EXCLUDED.lead_time_days`,
        [
          parentId,
          childId,
          item.componentName,
          item.spendUsd,
          item.leadTimeDays,
          item.shippingRoute || 'Standard Corridor',
        ]
      );
    }
  }

  return getSupplyChainDAG(orgId);
}
