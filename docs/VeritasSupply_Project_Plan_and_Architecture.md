## VeritasSupply - Implementation Plan and System Architecture

- [VeritasSupply — Implementation Plan & System Architecture](file:///home/claude/toPdfViaTempFile554-0.html#veritassupply-implementation-plan-system-architecture)

- [Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine 1. Scope Strategy (read this first)](file:///home/claude/toPdfViaTempFile554-0.html#autonomous-ai-tier-n-supply-chain-disruption-sanctionsesg-intelligence-engine)

- [2. Role Split (2 contributors)](file:///home/claude/toPdfViaTempFile554-0.html#role-split-2-contributors)

- [3. Step-by-Step Implementation Plan](file:///home/claude/toPdfViaTempFile554-0.html#step-by-step-implementation-plan)

- [Phase 0 — Foundation (Hours 0–3)](file:///home/claude/toPdfViaTempFile554-0.html#phase-0-foundation-hours-03)

- [Phase 1 — Data Layer & Ingestion (Hours 3–10) — Contributor A](file:///home/claude/toPdfViaTempFile554-0.html#phase-1-data-layer-ingestion-hours-310-contributor-a)

- [Phase 2 — Graph Visualization (Hours 3–14, parallel) — Contributor B](file:///home/claude/toPdfViaTempFile554-0.html#phase-2-graph-visualization-hours-314-parallel-contributor-b)

- [Phase 3 — Agentic Disruption Sentinel (Hours 10–20) — Contributor A (+ B for UI hooks)](file:///home/claude/toPdfViaTempFile554-0.html#phase-3-agentic-disruption-sentinel-hours-1020-contributor-a-b-for-ui-hooks)

- [Phase 4 — Autonomous Mitigation & Rerouting Engine (Hours 16–24) — Contributor A](file:///home/claude/toPdfViaTempFile554-0.html#phase-4-autonomous-mitigation-rerouting-engine-hours-1624-contributor-a)

- [Phase 5 — Dashboards & Polish (Hours 20–28) — Contributor B](file:///home/claude/toPdfViaTempFile554-0.html#phase-5-dashboards-polish-hours-2028-contributor-b)

- [Phase 6 — Demo Rehearsal & Buffer (Hours 28–32+)](file:///home/claude/toPdfViaTempFile554-0.html#phase-6-demo-rehearsal-buffer-hours-2832)

- [4. System Architecture](file:///home/claude/toPdfViaTempFile554-0.html#system-architecture)

- [5. Data Model (core tables)](file:///home/claude/toPdfViaTempFile554-0.html#data-model-core-tables)

- [6. AI Layer — Agent Responsibilities](file:///home/claude/toPdfViaTempFile554-0.html#ai-layer-agent-responsibilities)

- [7. Milestone Checklist (condensed)](file:///home/claude/toPdfViaTempFile554-0.html#milestone-checklist-condensed)

- [8. Suggested Demo Script (90–120 seconds)](file:///home/claude/toPdfViaTempFile554-0.html#suggested-demo-script-90120-seconds)

- [9. Risks to the Build Itself (manage these proactively)](file:///home/claude/toPdfViaTempFile554-0.html#risks-to-the-build-itself-manage-these-proactively)

## VeritasSupply — Implementation Plan & System Architecture

Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine

Team size: 2 contributors. Format assumed: 24–48 hour hackathon build, demoable end-to-end.

## 1. Scope Strategy (read this first)

With 2 people and a hackathon clock, the biggest risk is scope. The stack you listed is enterprise-grade — the plan below deliberately narrows it into a thin but real vertical slice:

- One BOM upload → one real DAG → one live-looking graph → one simulated disruption → one auto-generated mitigation memo.

- Everything else (multi-tenant auth, real satellite/news feeds, a real global supplier database) gets stubbed with realistic seed data, not skipped conceptually — just not built as production infra.

Judges reward a working narrative loop over a half-built enterprise system. Build the loop first, harden it second.

## 2. Role Split (2 contributors)

Contributor A — “Data & Backend” - Postgres schema, recursive supplier hierarchy queries - BOM/PDF ingestion pipeline, LLM structured extraction - Disruption Sentinel agent + Mitigation Engine (agent reasoning, Next.js Server Actions / API routes) - Seed data (fake but realistic supplier DB, disruption event feed)

Contributor B — “Graph & Frontend”

(rendering, node states, layout) - Recharts dashboards (risk exposure, Scope-3 emissions, cost variance) - Procurement Switch Memo UI + polish/demo flow

Shared: data contracts (TypeScript types / Zod schemas) — agree these on Hour 0 so both sides can build in parallel against mocks.

\- Next.js App Router shell, Tailwind + Shadcn UI - React Flow dependency graph

## 3. Step-by-Step Implementation Plan

## Phase 0 — Foundation (Hours 0–3)

- 1. Repo scaffold: create-next-app (App Router, TS, Tailwind, Shadcn init).

- 2. Provision Postgres (Supabase or Neon) — grab connection string, enable semantic supplier matching — otherwise skip). pgvector ? (optional, only if you want

- 3. Define shared TypeScript/Zod types for: Supplier , SupplierEdge (BOM dependency) , DisruptionEvent , RiskScore , MitigationMemo . Commit this file first — it’s the contract between the two of you.

- 4. Design DB schema (Section 5) and run initial migration.

- 5. Agree on the demo narrative script now (Section 8) — build toward it, not away from it.


## Phase 1 — Data Layer & Ingestion (Hours 3–10) — Contributor A

- 1. Seed database: 1 enterprise (Tier-0), ~6 Tier-1 suppliers, ~15 Tier-2, ~10 Tier-3/4, with realistic countries/materials (e.g., lithium refiner in Chile, silicon smelter in Xinjiang, cobalt miner in DRC) — this seed data is your storytelling device, choose entries that map to real disruption archetypes (forced labor sanctions, flood zones, port chokepoints).

- 2. Build BOM ingestion endpoint:

- Accept CSV/XLSX/PDF upload.

- Parse tabular formats directly (rows → line items).

- For PDFs/invoices: send extracted text to Claude/OpenAI with a strict structured-output schema (supplier name, part, tier hint, country, spend) — validate with Zod, reject/repair malformed responses.

- 3. Recursive tree construction: given flat extracted rows + a partial supplier registry, resolve each line item to a supplier node and build parent→child edges. Use a Postgres recursive CTE ( WITH RECURSIVE ) to reconstruct the full N- tier tree from an edge table — don’t hand-roll tree traversal in application code, let Postgres do it.

- 4. Expose a /api/supply-chain/:orgId endpoint returning the full DAG as { nodes, edges } JSON shaped for React Flow.

## Phase 2 — Graph Visualization (Hours 3–14, parallel) — Contributor B

- 1. Stand up React Flow canvas with custom node component (supplier name, tier badge, country flag, risk color ring).

- 2. Auto-layout: use dagre or elkjs with React Flow for tiered left-to-right (or radial) layout — Tier-0 center, Tier-N outward. Don’t hand-place nodes.

- 3. Color/state system: gray (nominal) → amber (elevated risk) → red (critical/disrupted), driven by a riskScore field on each node, poll or subscribe for updates.

- 4. Node click → side panel: supplier detail, dependent downstream products, current risk factors.

- 5. Critical-path highlighting: on load, run a simple algorithm (e.g., identify single-parent chains / bridge edges in the DAG) to flag single-points-of-failure with a distinct visual treatment (dashed red border, “SPOF” badge) — this is a huge, cheap “wow” feature for judges.

## Phase 3 — Agentic Disruption Sentinel (Hours 10–20) — Contributor A (+ B for UI hooks)

- 1. Simulated event feed (do this before/instead of real scraping — reliability > realism under time pressure): a seeded table of disruption events (type: flood / sanction / port-closure / labor-violation; affected country/region; severity; source blurb), plus a “trigger” endpoint/cron that periodically (or on a timer during the demo) activates one against a matching supplier by country/material.

- 2. (Stretch, only if time allows) Real signal: one live web-search or news-API call per demo trigger to fetch a real recent headline matching the event’s country, to make the “source” citation feel authentic — keep it optional and behind a fallback to seed data.

- 3. Risk scoring agent: an LLM-reasoning step (or deterministic rule engine backed by an LLM explanation layer) that, given a disruption event + supplier metadata, outputs a structured RiskScore (probability, severity, confidence, rationale) via structured JSON output.

- 4. Propagation logic: recursively walk up the DAG (child → parent → …→ Tier-0) via the same recursive CTE pattern, attenuating risk score per hop, so a Tier-4 disruption visibly raises risk on Tier-1 and the enterprise’s own finished- good nodes. This propagation is the core “autonomous intelligence” story beat — spend real time here.

- 5. Push updates to frontend: simplest reliable option for a hackathon is short-interval polling (e.g., every 3–5s) of a /api/risk-state/:orgId endpoint; use Supabase Realtime or a WebSocket only if time genuinely allows — don’t burn hours on real-time infra that a demo doesn’t strictly need.

## Phase 4 — Autonomous Mitigation & Rerouting Engine (Hours 16–24) — Contributor A

- 1. Seed a small “global alternate supplier” table with 2–3 plausible alternates per material/region, pre-tagged with price index, lead time, compliance certifications, and emissions factor.

- 2. On node going red: agent step queries alternates, filters by compliance/certification match, ranks by a simple weighted score (price Δ, lead-time Δ, avoided Scope-3 emissions, compliance risk).

- 3. Generate the Procurement Switch Memo via structured LLM output: recommended alternate, price variance %, lead-time impact (days), avoided Scope-3 emissions (est. tCO2e), compliance rationale, 2–3 sentence executive summary — return as structured JSON, render as a formatted card/document in the UI (and optionally an exportable PDF — nice-to-have, not core).

- 4. Wire a “Generate Mitigation Memo” action on red nodes in the graph UI.

## Phase 5 — Dashboards & Polish (Hours 20–28) — Contributor B

- 1. Recharts: portfolio-level risk exposure over time, spend-at-risk by region, Scope-3 emissions avoided (running counter — great demo visual).

- 2. Empty/loading states, error boundaries, responsive pass.

- 3. Seed a clean, compelling default dataset so a cold demo always looks good even if live triggers fail.

- 4. Landing/upload screen copy aligned to the SDG 8 / SDG 12 framing — judges reward explicit articulation of impact.

## Phase 6 — Demo Rehearsal & Buffer (Hours 28–32+)

- 1. Script and rehearse the exact click-path (Section 8) at least twice, timed.


- 2. Record a 90-second backup video in case live demo/API/network fails.

- 3. Cut anything flaky. A smaller, reliable demo beats a bigger broken one.

## 4. System Architecture

```
│ CLIENT (Browser) │ │ Next.js App Router · Tailwind · Shadcn UI │
│ │ │ Upload / Intake│ │ React Flow Canvas │ │ Recharts Dashboards │ │
│ │ (BOM/PDF drop) │ │ (Dependency DAG, │ │ (risk, spend, Scope-3)│ │ │ │ │ │ live risk color) │ │ │ │
│ │ │ │ poll/subscribe │ │
│ POST /api/ingest │ GET /api/supply-chain/:id │ GET /api/risk-state
│ APPLICATION LAYER (Next.js Server) │ │ Server Actions / API Routes · TypeScript · Zod validation │
│ │
│ │ Ingestion Service │ │ Disruption Sentinel │ │ Mitigation Engine│ │ │ │ - Parse CSV/XLSX │ │ Agent │ │ Agent │ │
│ │ - LLM structured │ │ - Event feed reader │ │ - Alt-supplier │ │ │ │ extraction (PDFs) │ │ - Risk scoring (LLM) │ │ matching │ │
│ │ - Entity resolution │ │ - DAG risk │ │ - Ranking │ │ │ │ to supplier nodes │ │ propagation (CTE) │ │ - Switch Memo gen │ │
│ └─────────┬───────────┘ └──────────┬───────────┘ └────────┬──────────┘ │ │ │ │ │ │
│ POSTGRESQL (Supabase / Neon) │ │ suppliers · supplier_edges (DAG) · disruption_events · risk_scores │
│ alternate_suppliers · mitigation_memos · organizations · boms │ │ Recursive CTEs: tree reconstruction (down) + risk propagation (up) │
│ structured JSON calls (function-calling / JSON mode)
│ AI LAYER — Claude / OpenAI API │ │ 1. BOM/contract structured extraction │
│ 2. Risk-scoring reasoning (event + supplier → probability/severity) │ │ 3. Multi-step mitigation reasoning (alt-supplier selection + memo copy)│
```

Data flow narrative: Upload → Extraction (AI) → DAG persisted (Postgres) → Rendered (React Flow) → Sentinel Agent detects/simulates disruption → Risk propagates up DAG (recursive CTE) → Graph nodes recolor (poll) → User clicks red node → Mitigation Engine agent reasons over alternates → Switch Memo rendered.

## 5. Data Model (core tables)

```
organizations (id, name, industry)
suppliers ( id, org_id, name, country, tier INT,
material_category, certifications TEXT[], lat, lng, created_at
)
supplier_edges ( -- the DAG id, parent_supplier_id REFERENCES suppliers(id), -- consumer / upstream side
child_supplier_id REFERENCES suppliers(id), -- supplies into parent component_name, spend_usd, lead_time_days
)
disruption_events ( id, supplier_id REFERENCES suppliers(id),
type, -- flood | sanction | labor_violation | port_closure | ... severity FLOAT, source_summary TEXT, source_url,
triggered_at )
risk_scores ( id, supplier_id REFERENCES suppliers(id),
probability FLOAT, severity FLOAT, confidence FLOAT, rationale TEXT, computed_at
)
alternate_suppliers ( id, replaces_supplier_id REFERENCES suppliers(id),
name, country, price_index FLOAT, lead_time_days, emissions_factor FLOAT, certifications TEXT[]
)
mitigation_memos ( id, disrupted_supplier_id, alternate_supplier_id,
price_variance_pct, lead_time_delta_days, avoided_scope3_tco2e, compliance_rationale TEXT,
summary TEXT, generated_at )
```

## Tree reconstruction (down the DAG)

```
WITH RECURSIVE bom_tree AS ( SELECT id, name, tier, 0 AS depth
FROM suppliers WHERE id = :root_org_supplier_id UNION ALL
SELECT s.id, s.name, s.tier, bt.depth + 1 FROM suppliers s
JOIN supplier_edges e ON e.child_supplier_id = s.id JOIN bom_tree bt ON bt.id = e.parent_supplier_id
) SELECT * FROM bom_tree ORDER BY depth;
```

## Risk propagation (up the DAG)

```
WITH RECURSIVE risk_up AS ( SELECT supplier_id, probability, severity, 1.0 AS decay
FROM risk_scores WHERE supplier_id = :disrupted_id UNION ALL
SELECT e.parent_supplier_id, r.probability, r.severity, r.decay * 0.7 FROM supplier_edges e
JOIN risk_up r ON r.supplier_id = e.child_supplier_id )
SELECT supplier_id, MAX(probability * decay) AS propagated_risk FROM risk_up GROUP BY supplier_id;
```

## 6. AI Layer — Agent Responsibilities


| Agent | Input | Output (structured JSON) | Notes |
| --- | --- | --- | --- |
|   |   | { lineItems: [{ supplierName, | Strict schema, Zod-validated, |
| Extraction Agent | Raw BOM text/PDF text | country, part, tier, spendUsd | retry-on-failure |
|   |   | }] } |   |
| Risk Scoring Agent | Disruption event + supplier | { probability, severity, | Deterministic-leaning prompt; |
|   | metadata | confidence, rationale } | keep temperature low |
|   |   | { recommendedAlternateId, |   |
|   | Disrupted supplier + candidate | priceVariancePct, | This is your “wow” output — |
| Mitigation Agent | alternates | leadTimeDeltaDays, | invest in prompt quality and |
|   |   | avoidedScope3Tco2e, rationale, | formatting |
|   |   | executiveSummary } |   |

Keep all three agents as separate, narrowly-scoped prompts rather than one mega-agent — easier to debug under time pressure, and each maps cleanly to one demo beat.

## 7. Milestone Checklist (condensed)

Shared types/schema committed (Hour 3)

Seed data loaded, recursive tree query working (Hour 8)

BOM upload → DAG persisted end-to-end (Hour 10)

React Flow graph renders seeded DAG with tiered layout (Hour 12)

Disruption trigger recolors correct node (Hour 16)

Risk propagates visibly up the tree (Hour 20)

Mitigation memo generates on red-node click (Hour 24)

Dashboards + polish (Hour 28)

Full demo rehearsed twice, backup video recorded (Hour 32)

## 8. Suggested Demo Script (90–120 seconds)

- 1. “Manufacturers can see Tier-1. We show them Tier-4.” — open on empty upload screen.

- 2. Drop a sample BOM/invoice → structured extraction happens live → DAG appears.

- 3. Zoom into the graph: point out a Tier-3 lithium refiner buried three hops away, flagged as a single point of failure.

- 4. Trigger (or let the seeded timer trigger) a disruption event on that node — watch it flip amber → red, and watch the risk visibly climb up through Tier-2 and Tier-1 to the enterprise’s own product line.

- 5. Click the red node → “Generate Mitigation Memo” → structured memo appears: alternate supplier, price variance, lead-time impact, avoided Scope-3 emissions.

- 6. Cut to the dashboard: running “Scope-3 emissions avoided” counter, spend-at-risk chart.

- 7. Close on the SDG 8 / SDG 12 framing line.

## 9. Risks to the Build Itself (manage these proactively)

- PDF extraction flakiness — mitigate with a CSV/XLSX fast-path as the primary demo input; keep PDF as a stretch/backup.

- Real-time infra eating hours — default to polling; only reach for WebSockets/Realtime if Phase 3–4 finish early.

- Graph auto-layout fighting you — use dagre early, don’t hand-tune positions.

- LLM structured-output drift — validate every AI response with Zod and have a hardcoded fallback object per call site so a bad response never blanks the UI mid-demo.

- Scope creep into “real” scraping/sanctions APIs — resist; seeded, well-chosen event data tells the same story with zero uptime risk.
