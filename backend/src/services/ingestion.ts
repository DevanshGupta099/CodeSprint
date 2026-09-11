import { z } from 'zod';
import { query } from '../db/index.js';
import { getSupplyChainDAG } from '../db/queries.js';

export const BOMLineItemSchema = z.object({
  supplierName: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  country: z.string().min(1).max(100),
  countryCode: z.string().length(3),
  tier: z.number().int().min(0).max(4),
  materialCategory: z.string().min(1).max(100),
  componentName: z.string().min(1).max(200),
  spendUsd: z.number().min(0),
  leadTimeDays: z.number().int().min(0),
  parentSupplierCode: z.string().min(1).max(50),
  shippingRoute: z.string().optional().default('Standard Corridor'),
  lat: z.number().optional().default(0),
  lng: z.number().optional().default(0),
});

export type BOMLineItem = z.infer<typeof BOMLineItemSchema>;

/**
 * Robust CSV parser that handles commas inside quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Parses CSV text containing BOM line items and validates with Zod
 */
export function parseBOMCSV(csvText: string): { items: BOMLineItem[]; errors: { row: number; error: string }[] } {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { items: [], errors: [{ row: 0, error: 'CSV file must contain a header and at least one data row' }] };
  }

  const items: BOMLineItem[] = [];
  const errors: { row: number; error: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 10) {
      errors.push({ row: i + 1, error: `Row has insufficient columns (${cols.length}/10 required)` });
      continue;
    }

    const rawObj = {
      supplierName: cols[0],
      code: cols[1],
      country: cols[2],
      countryCode: cols[3]?.toUpperCase(),
      tier: parseInt(cols[4], 10),
      materialCategory: cols[5],
      componentName: cols[6],
      spendUsd: parseFloat(cols[7]),
      leadTimeDays: parseInt(cols[8], 10),
      parentSupplierCode: cols[9],
      shippingRoute: cols[10] || 'Standard Corridor',
      lat: cols[11] ? parseFloat(cols[11]) : 0,
      lng: cols[12] ? parseFloat(cols[12]) : 0,
    };

    const parseResult = BOMLineItemSchema.safeParse(rawObj);
    if (!parseResult.success) {
      errors.push({
        row: i + 1,
        error: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    } else {
      items.push(parseResult.data);
    }
  }

  return { items, errors };
}

/**
 * Ingests validated BOM line items into database and links edges
 */
export async function ingestBOMItems(orgId: string, items: BOMLineItem[]) {
  if (items.length === 0) {
    throw new Error('No valid BOM line items to ingest');
  }

  // Check if organization exists
  const orgCheck = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
  if (orgCheck.rows.length === 0) {
    throw new Error(`Organization with ID '${orgId}' not found`);
  }

  const codeToIdMap = new Map<string, string>();

  // 1. Fetch existing suppliers for code lookup
  const existingSuppliers = await query('SELECT id, code FROM suppliers WHERE org_id = $1', [orgId]);
  for (const row of existingSuppliers.rows) {
    codeToIdMap.set(row.code, row.id);
  }

  // 2. Upsert suppliers
  for (const item of items) {
    const ins = await query(
      `INSERT INTO suppliers (
        org_id, name, code, country, country_code, tier, material_category,
        spend, lead_time_days, lat, lng
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name,
        country = EXCLUDED.country,
        country_code = EXCLUDED.country_code,
        tier = EXCLUDED.tier,
        material_category = EXCLUDED.material_category,
        spend = EXCLUDED.spend,
        lead_time_days = EXCLUDED.lead_time_days,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng
      RETURNING id`,
      [
        orgId,
        item.supplierName,
        item.code,
        item.country,
        item.countryCode,
        item.tier,
        item.materialCategory,
        item.spendUsd / 1000000, // Store in Millions USD
        item.leadTimeDays,
        item.lat || 0,
        item.lng || 0,
      ]
    );
    const supplierId = ins.rows[0].id;
    codeToIdMap.set(item.code, supplierId);
  }

  // 3. Upsert edges
  let linkedEdgesCount = 0;
  for (const item of items) {
    const childId = codeToIdMap.get(item.code);
    const parentId = codeToIdMap.get(item.parentSupplierCode);

    if (childId && parentId && childId !== parentId) {
      await query(
        `INSERT INTO supplier_edges (
          parent_supplier_id, child_supplier_id, component_name, spend_usd, lead_time_days, shipping_route
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (parent_supplier_id, child_supplier_id) DO UPDATE SET 
          component_name = EXCLUDED.component_name,
          spend_usd = EXCLUDED.spend_usd,
          lead_time_days = EXCLUDED.lead_time_days,
          shipping_route = EXCLUDED.shipping_route`,
        [
          parentId,
          childId,
          item.componentName,
          item.spendUsd,
          item.leadTimeDays,
          item.shippingRoute || 'Standard Corridor',
        ]
      );
      linkedEdgesCount++;
    }
  }

  const updatedDAG = await getSupplyChainDAG(orgId);
  return {
    dag: updatedDAG,
    ingestedSuppliersCount: items.length,
    linkedEdgesCount,
  };
}
