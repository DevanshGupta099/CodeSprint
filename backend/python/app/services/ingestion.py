import csv
import io
from typing import List, Dict, Any, Tuple
from ..db.connection import get_db_cursor
from ..db.cte_queries import get_supply_chain_dag
from ..models.schemas import SupplyChainDAGResponse


def parse_bom_csv(csv_text: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses CSV text containing BOM line items into structured dictionaries.
    Uses standard csv.reader to safely handle quoted fields containing commas.
    """
    reader = csv.reader(io.StringIO(csv_text.strip()))
    rows = list(reader)
    if len(rows) < 2:
        return [], ["CSV file must contain a header row and at least one data row"]

    header = [h.strip() for h in rows[0]]
    items: List[Dict[str, Any]] = []
    errors: List[str] = []

    for idx, row in enumerate(rows[1:], start=2):
        if not row or all(c.strip() == "" for c in row):
            continue
        if len(row) < 10:
            errors.append(f"Row {idx}: Insufficient columns ({len(row)}/10 required)")
            continue

        try:
            item = {
                "supplierName": row[0].strip(),
                "code": row[1].strip(),
                "country": row[2].strip(),
                "countryCode": row[3].strip().upper(),
                "tier": int(row[4].strip()),
                "materialCategory": row[5].strip(),
                "componentName": row[6].strip(),
                "spendUsd": float(row[7].strip()),
                "leadTimeDays": int(row[8].strip()),
                "parentSupplierCode": row[9].strip(),
                "shippingRoute": row[10].strip() if len(row) > 10 and row[10].strip() else "Standard Corridor",
                "lat": float(row[11].strip()) if len(row) > 11 and row[11].strip() else 0.0,
                "lng": float(row[12].strip()) if len(row) > 12 and row[12].strip() else 0.0,
            }
            items.append(item)
        except Exception as e:
            errors.append(f"Row {idx}: Data conversion error ({str(e)})")

    return items, errors


def ingest_bom_items(org_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Ingests validated BOM items into PostgreSQL suppliers and supplier_edges.
    """
    if not items:
        raise ValueError("No valid BOM line items to ingest")

    with get_db_cursor(commit=True) as cur:
        # 1. Verify organization
        cur.execute("SELECT id FROM organizations WHERE id = %s", (org_id,))
        if not cur.fetchone():
            raise ValueError(f"Organization with ID '{org_id}' not found")

        # 2. Build code to ID map
        cur.execute("SELECT id, code FROM suppliers WHERE org_id = %s", (org_id,))
        code_to_id = {r[1]: str(r[0]) for r in cur.fetchall()}

        # 3. Upsert suppliers
        for item in items:
            spend_millions = item["spendUsd"] / 1_000_000.0
            cur.execute("""
                INSERT INTO suppliers (
                    org_id, name, code, country, country_code, tier, material_category,
                    spend, lead_time_days, lat, lng
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                RETURNING id
            """, (
                org_id, item["supplierName"], item["code"], item["country"],
                item["countryCode"], item["tier"], item["materialCategory"],
                spend_millions, item["leadTimeDays"], item["lat"], item["lng"]
            ))
            supplier_id = str(cur.fetchone()[0])
            code_to_id[item["code"]] = supplier_id

        # 4. Upsert edges
        linked_edges_count = 0
        for item in items:
            child_id = code_to_id.get(item["code"])
            parent_id = code_to_id.get(item["parentSupplierCode"])

            if child_id and parent_id and child_id != parent_id:
                cur.execute("""
                    INSERT INTO supplier_edges (
                        parent_supplier_id, child_supplier_id, component_name, spend_usd, lead_time_days, shipping_route
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (parent_supplier_id, child_supplier_id) DO UPDATE SET 
                        component_name = EXCLUDED.component_name,
                        spend_usd = EXCLUDED.spend_usd,
                        lead_time_days = EXCLUDED.lead_time_days,
                        shipping_route = EXCLUDED.shipping_route
                """, (
                    parent_id, child_id, item["componentName"],
                    item["spendUsd"], item["leadTimeDays"], item["shippingRoute"]
                ))
                linked_edges_count += 1

    updated_dag = get_supply_chain_dag(org_id)
    return {
        "dag": updated_dag,
        "ingestedSuppliersCount": len(items),
        "linkedEdgesCount": linked_edges_count
    }
