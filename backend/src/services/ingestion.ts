import { z } from 'zod';
import * as XLSX from 'xlsx';
import { query } from '../db/index.js';
import { getSupplyChainDAG } from '../db/queries.js';
import { extractBOMWithAI } from './gemini.js';

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
 * Parses binary Excel workbook (.xlsx, .xls) and validates rows with Zod
 */
export function parseBOMXLSX(buffer: Buffer): { items: BOMLineItem[]; errors: { row: number; error: string }[] } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { items: [], errors: [{ row: 0, error: 'Excel workbook contains no readable sheets' }] };
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return { items: [], errors: [{ row: 0, error: 'First sheet in Excel workbook is empty' }] };
    }

    const items: BOMLineItem[] = [];
    const errors: { row: number; error: string }[] = [];

    rawRows.forEach((row, idx) => {
      const normalized: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        const cleanKey = k.toLowerCase().replace(/[\s_\-()]/g, '');
        normalized[cleanKey] = v;
      }

      const supplierName =
        normalized['suppliername'] || normalized['supplier'] || normalized['name'] || normalized['vendor'] || '';
      const code = normalized['code'] || normalized['suppliercode'] || normalized['id'] || '';
      const country = normalized['country'] || normalized['location'] || 'United States';
      const rawCountryCode =
        normalized['countrycode'] ||
        normalized['iso'] ||
        (country ? String(country).slice(0, 3).toUpperCase() : 'USA');
      const countryCode = String(rawCountryCode).toUpperCase().slice(0, 3);
      const tier = parseInt(normalized['tier'] ?? 0, 10);
      const materialCategory =
        normalized['materialcategory'] || normalized['category'] || normalized['material'] || 'General Component';
      const componentName =
        normalized['componentname'] || normalized['component'] || normalized['part'] || normalized['description'] || '';
      const spendUsd = parseFloat(normalized['spendusd'] || normalized['spend'] || normalized['cost'] || 0);
      const leadTimeDays = parseInt(normalized['leadtimedays'] || normalized['leadtime'] || 0, 10);
      const parentSupplierCode =
        normalized['parentsuppliercode'] || normalized['parentcode'] || normalized['parent'] || 'ROOT';
      const shippingRoute = normalized['shippingroute'] || normalized['route'] || 'Standard Corridor';
      const lat = normalized['lat'] ? parseFloat(normalized['lat']) : 0;
      const lng = normalized['lng'] ? parseFloat(normalized['lng']) : 0;

      const candidateObj = {
        supplierName: String(supplierName).trim(),
        code: String(code).trim(),
        country: String(country).trim(),
        countryCode: countryCode,
        tier: isNaN(tier) ? 1 : tier,
        materialCategory: String(materialCategory).trim(),
        componentName: String(componentName).trim(),
        spendUsd: isNaN(spendUsd) ? 0 : spendUsd,
        leadTimeDays: isNaN(leadTimeDays) ? 0 : leadTimeDays,
        parentSupplierCode: String(parentSupplierCode).trim(),
        shippingRoute: String(shippingRoute).trim(),
        lat: isNaN(lat) ? 0 : lat,
        lng: isNaN(lng) ? 0 : lng,
      };

      const parseResult = BOMLineItemSchema.safeParse(candidateObj);
      if (!parseResult.success) {
        errors.push({
          row: idx + 2,
          error: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      } else {
        items.push(parseResult.data);
      }
    });

    return { items, errors };
  } catch (err: any) {
    return { items: [], errors: [{ row: 0, error: `Failed to parse Excel workbook: ${err.message}` }] };
  }
}

/**
 * Extracts printable text from PDF buffer with fallback
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    if (PDFParse) {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      if (textResult?.text && typeof textResult.text === 'string' && textResult.text.trim().length > 0) {
        return textResult.text;
      }
    }
  } catch (err: any) {
    console.warn(`[PDF_EXTRACT] PDFParse error: ${err.message}, attempting raw string extraction.`);
  }

  const raw = buffer.toString('latin1');
  const printableMatches = raw.match(/[\x20-\x7E\s]{4,}/g);
  return printableMatches ? printableMatches.join('\n') : '';
}

/**
 * Parses PDF invoices / BOM specifications using AI extraction agent
 */
export async function parseBOMPDF(
  buffer: Buffer,
  documentName: string = 'Procurement_Specification.pdf'
): Promise<{ items: BOMLineItem[]; extractionSource: string; errors: { row: number; error: string }[] }> {
  const text = await extractTextFromPDF(buffer);
  const aiResult = await extractBOMWithAI(text, documentName);

  const items: BOMLineItem[] = [];
  const errors: { row: number; error: string }[] = [];

  aiResult.lineItems.forEach((raw, idx) => {
    const parseResult = BOMLineItemSchema.safeParse(raw);
    if (!parseResult.success) {
      errors.push({
        row: idx + 1,
        error: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    } else {
      items.push(parseResult.data);
    }
  });

  return {
    items,
    extractionSource: aiResult.documentTitle || 'Autonomous AI Document Parser',
    errors,
  };
}

/**
 * Universal multi-format file parser (CSV, XLSX, PDF, JSON)
 */
export async function parseBOMFile(file: {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
}): Promise<{
  items: BOMLineItem[];
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  source?: string;
  errors: { row: number; error: string }[];
}> {
  const filename = (file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  if (
    filename.endsWith('.xlsx') ||
    filename.endsWith('.xls') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('excel')
  ) {
    const { items, errors } = parseBOMXLSX(file.buffer);
    return { items, format: 'xlsx', errors };
  }

  if (filename.endsWith('.pdf') || mimetype === 'application/pdf') {
    const { items, extractionSource, errors } = await parseBOMPDF(file.buffer, file.originalname);
    return { items, format: 'pdf', source: extractionSource, errors };
  }

  if (filename.endsWith('.json') || mimetype === 'application/json') {
    try {
      const parsed = JSON.parse(file.buffer.toString('utf-8'));
      const rawList = Array.isArray(parsed) ? parsed : parsed.lineItems || [];
      const items: BOMLineItem[] = [];
      const errors: { row: number; error: string }[] = [];
      rawList.forEach((it: any, idx: number) => {
        const res = BOMLineItemSchema.safeParse(it);
        if (res.success) items.push(res.data);
        else errors.push({ row: idx + 1, error: res.error.message });
      });
      return { items, format: 'json', errors };
    } catch (e: any) {
      return { items: [], format: 'json', errors: [{ row: 0, error: `JSON Parse error: ${e.message}` }] };
    }
  }

  // Default: CSV text
  const csvText = file.buffer.toString('utf-8');
  const { items, errors } = parseBOMCSV(csvText);
  return { items, format: 'csv', errors };
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
