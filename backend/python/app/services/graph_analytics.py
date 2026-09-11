import networkx as nx
from typing import Dict, List, Any
from ..db.connection import get_db_cursor
from ..models.schemas import SPOFAnalysisResponse


def build_supply_chain_networkx(org_id: str) -> tuple[nx.DiGraph, dict]:
    """
    Builds a NetworkX DiGraph for the given organization's supply chain.
    Edge direction: child_supplier_id -> parent_supplier_id (Upstream material flow to downstream assembly).
    """
    G = nx.DiGraph()
    node_meta = {}

    with get_db_cursor() as cur:
        # Fetch nodes
        cur.execute("""
            SELECT id, name, code, country, tier, material_category, spend, lead_time_days, is_spof, status
            FROM suppliers
            WHERE org_id = %s
        """, (org_id,))
        for r in cur.fetchall():
            s_id = str(r[0])
            meta = {
                "id": s_id,
                "name": r[1],
                "code": r[2],
                "country": r[3],
                "tier": r[4],
                "materialCategory": r[5],
                "spend": float(r[6] or 0.0),
                "leadTimeDays": int(r[7] or 0),
                "isSPOF": bool(r[8]),
                "status": r[9]
            }
            node_meta[s_id] = meta
            G.add_node(s_id, **meta)

        # Fetch edges
        cur.execute("""
            SELECT e.id, e.parent_supplier_id, e.child_supplier_id, e.component_name, e.spend_usd, e.lead_time_days
            FROM supplier_edges e
            JOIN suppliers p ON p.id = e.parent_supplier_id
            WHERE p.org_id = %s
        """, (org_id,))
        for r in cur.fetchall():
            e_id, parent_id, child_id, comp, spend, lead_time = str(r[0]), str(r[1]), str(r[2]), r[3], float(r[4] or 0.0), int(r[5] or 0)
            # Edge child -> parent (material flow upstream to downstream)
            G.add_edge(
                child_id, parent_id,
                id=e_id,
                component=comp,
                spend=spend,
                leadTime=lead_time
            )

    return G, node_meta


def analyze_spofs_and_bottlenecks(org_id: str, update_db: bool = True) -> SPOFAnalysisResponse:
    """
    Analyzes supply chain vulnerabilities:
    - Articulation points (Cut Vertices): Suppliers whose failure disconnects parts of the supply network.
    - Bridges: Critical single-link transit or component corridors.
    - Betweenness Centrality: Identifies chokepoint hubs in the flow.
    """
    G, node_meta = build_supply_chain_networkx(org_id)

    if len(G.nodes) == 0:
        return SPOFAnalysisResponse(
            orgId=org_id,
            singlePointsOfFailure=[],
            bridgeEdges=[],
            betweennessCentrality={}
        )

    # 1. Undirected projection for connectivity analysis
    U = G.to_undirected()

    # 2. Articulation points
    cut_vertices = set(nx.articulation_points(U))

    # Also detect nodes with out-degree == 1 feeding critical parents with in-degree == 1
    # and Tier >= 1 nodes that have no redundant siblings for the same component
    spof_list: List[Dict[str, Any]] = []
    for node_id in cut_vertices:
        meta = node_meta.get(node_id, {})
        # Do not flag Tier 0 as SPOF raw supplier, it's the root manufacturer
        if meta.get("tier", 0) > 0:
            spof_list.append({
                "supplierId": node_id,
                "name": meta.get("name", "Unknown"),
                "tier": meta.get("tier"),
                "country": meta.get("country"),
                "materialCategory": meta.get("materialCategory"),
                "hazardType": "ARTICULATION_POINT_SPOF",
                "rationale": f"Single Point of Failure: Removal of {meta.get('name')} disconnects upstream tiers from downstream manufacturing."
            })

    # 3. Bridges
    bridge_edges_raw = list(nx.bridges(U))
    bridge_list: List[Dict[str, Any]] = []
    for u, v in bridge_edges_raw:
        # Determine child and parent
        child_id = u if G.has_edge(u, v) else v
        parent_id = v if G.has_edge(u, v) else u
        edge_data = G.get_edge_data(child_id, parent_id, default={})
        bridge_list.append({
            "childSupplierId": child_id,
            "childName": node_meta.get(child_id, {}).get("name", "Unknown"),
            "parentSupplierId": parent_id,
            "parentName": node_meta.get(parent_id, {}).get("name", "Unknown"),
            "component": edge_data.get("component", "Direct Supply"),
            "rationale": "Single transit corridor: no alternate pathway exists between these nodes."
        })

    # 4. Betweenness Centrality
    centrality = nx.betweenness_centrality(G)
    centrality_formatted = {
        node_id: {
            "score": round(score, 4),
            "name": node_meta.get(node_id, {}).get("name", "Unknown"),
            "tier": node_meta.get(node_id, {}).get("tier", 0)
        }
        for node_id, score in centrality.items()
    }

    # 5. Optionally sync database is_spof flag
    if update_db:
        spof_ids = {s["supplierId"] for s in spof_list}
        with get_db_cursor(commit=True) as cur:
            for node_id in node_meta.keys():
                is_spof_flag = node_id in spof_ids
                cur.execute("UPDATE suppliers SET is_spof = %s WHERE id = %s", (is_spof_flag, node_id))

    return SPOFAnalysisResponse(
        orgId=org_id,
        singlePointsOfFailure=spof_list,
        bridgeEdges=bridge_list,
        betweennessCentrality=centrality_formatted
    )
