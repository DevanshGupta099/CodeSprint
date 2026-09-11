# VeritasSupply — Corrected Implementation Plan & Architecture
### Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine

---

## 0. What Was Wrong With the Original Plan

| Issue | Original | Fix |
|---|---|---|
| **Timeline format** | Hour-by-hour plan (Hours 0–32+), written like a single overnight hackathon | Re-timed to the actual calendar: kickoff today → team meeting tomorrow → LinkedIn checkpoint Wednesday → presentation Thursday |
| **No commit cadence** | Judging criteria include *consistent daily GitHub commits*, never referenced in the plan | Each day now ends with a defined, committable, working state — not just "progress" |
| **No LinkedIn checkpoint** | Documentation/visibility bonus not mentioned | Built into Day 2 as a hard deliverable (a working demo clip, not just a screenshot) |
| **Nothing ready for tomorrow's team meeting** | Phase 0–1 only produce scaffolding and a DB schema by "Hour 10" | Day 0 now explicitly ends with an architecture walkthrough + clickable wireframe, so there's something real to present |
| **Schema comment bug** | `parent_supplier_id` labeled "upstream" | Corrected: parent = downstream/consumer side, child = upstream/raw-material side |
| **SDG framing as an afterthought** | SDG 8/12 mentioned only as a closing demo line | Since SDG alignment is explicitly scored, it's now reflected in feature choices (labor-violation/emissions tracking) and copy, not just a tagline |
| **Team size assumption** | Hardcoded as 2 contributors | Kept as the working assumption (matches the plan's role split) — confirm with your core-member contact before Day 0 ends |

The original document's *technical* instincts (thin vertical slice, recursive CTEs, structured LLM output, polling over WebSockets, seeded data over live scraping) were all correct and are preserved below. What needed fixing was the calendar and the scoring alignment, not the architecture.

---

## 1. Project Context (plain-English version)

**The problem:** manufacturers can see their Tier-1 suppliers (who they buy directly from) but have almost no visibility past that. A flood at a Tier-3 lithium refiner, or a forced-labor sanction on a Tier-4 cobalt miner, doesn't surface until a Tier-1 assembly line halts weeks later.

**The pitch:** upload a bill of materials → the system reconstructs the full multi-tier dependency tree → an agent watches for disruptions (simulated for the demo, framed as real) → risk propagates visibly up the tree → when a node goes critical, an agent recommends a compliant alternate supplier and writes a memo justifying the switch, including estimated Scope-3 emissions avoided.

**Why it's a strong choice for this format:** it's a real enterprise problem (Palantir Foundry / Sourcemap territory), it has a genuine "wow" visual (a live graph turning red and re-routing), it maps cleanly to SDG 8 (Decent Work) and SDG 12 (Responsible Consumption/Production), and it decomposes into independent, parallelizable pieces for a 2-person team.

**What makes it *not* overscoped**, despite sounding enterprise-grade: everything outside the core loop (auth, real satellite/news feeds, a real global supplier registry) is stubbed with realistic seed data rather than built. The judged deliverable is one believable end-to-end narrative, not a production system.

---

## 2. Team Roles

**Contributor A — Data & Backend**
- Postgres schema + recursive supplier-hierarchy queries
- BOM/PDF ingestion pipeline, LLM structured extraction
- Disruption Sentinel agent + Mitigation Engine agent
- Seed data (supplier DB, disruption event feed, alternates table)

**Contributor B — Graph & Frontend**
- Next.js shell, Tailwind + shadcn/ui
- React Flow dependency graph (layout, node states, side panel)
- Recharts dashboards
- Mitigation memo UI, polish, demo flow

**Shared, agreed on Day 0 before splitting off:** TypeScript/Zod types for `Supplier`, `SupplierEdge`, `DisruptionEvent`, `RiskScore`, `MitigationMemo`. This is the contract that lets both of you build against mocks in parallel — commit it first, before either of you writes feature code.

*(Confirm actual team size against your assignment before treating this 2-role split as final.)*

---

## 3. Day-by-Day Plan

### Day 0 — Today: Foundation + Prep for Tomorrow's Meeting
1. `create-next-app` (App Router, TS, Tailwind, shadcn init). Provision Postgres (Supabase or Neon).
2. Commit the shared Zod/TS types file first — this is the contract, not a nice-to-have.
3. Run the DB migration (schema in Section 6).
4. Agree on the demo script now (Section 9) — build toward it, not away from it.
5. **Before the day ends, produce the thing you actually need for tomorrow:** a one-page architecture walkthrough (this doc's diagram is enough) plus a rough clickable wireframe or static mock of the upload → graph → red-node → memo flow. It does not need to be wired to real data. This is what gets presented at the team meeting — don't walk in with only a DB schema.
6. First commit of the day, end of day.

### Day 1 — Team Meeting Day
- Present the architecture + wireframe walkthrough at the team meeting.
- Contributor A: seed database (1 org, ~6 Tier-1, ~15 Tier-2, ~10 Tier-3/4 — pick countries/materials that map to real disruption archetypes: lithium in Chile, silicon in Xinjiang, cobalt in DRC). Build the BOM ingestion endpoint (CSV/XLSX fast path first; PDF via LLM extraction as a stretch, not the primary demo path). Recursive CTE for tree reconstruction; expose `/api/supply-chain/:orgId`.
- Contributor B: React Flow canvas with custom node component, dagre/elkjs auto-layout (tiered, don't hand-place nodes), color/state system (gray/amber/red), node-click side panel.
- **End of day:** BOM upload → persisted DAG → rendered graph, working end-to-end even with seed-only data. Commit.

### Day 2 — Wednesday: Feature-Complete + LinkedIn Checkpoint
- Contributor A: seeded disruption event feed + trigger mechanism; risk-scoring agent (structured JSON, low temperature); risk-propagation CTE walking child → parent with decay; `/api/risk-state/:orgId` polled every 3–5s. Then: alternate-supplier table, mitigation agent, Procurement Switch Memo generation, `/api/mitigation/:supplierId`.
- Contributor B: wire the "Generate Mitigation Memo" action on red nodes; critical-path / single-point-of-failure highlighting (dashed border, "SPOF" badge — cheap, high-impact); start Recharts dashboards.
- **Hard deliverable for today, not optional:** record a short screen capture of the live loop (upload → disruption → red propagation → memo) and post it to LinkedIn before end of day. This is directly scored — don't let it slip to Thursday.
- Commit.

### Day 3 — Thursday: Polish, Rehearse, Present
1. Finish dashboards (risk exposure over time, spend-at-risk by region, Scope-3 emissions-avoided counter).
2. Empty/loading states, error boundaries, responsive pass.
3. Make sure the *cold* demo dataset looks good even if a live trigger fails.
4. Rehearse the exact click-path (Section 9) at least twice, timed.
5. Record a 90-second backup video in case live demo/network fails during judging.
6. Cut anything flaky — a smaller, reliable demo beats a bigger broken one.
7. Present.

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                                          │
│ Next.js App Router · Tailwind · shadcn/ui                                │
│ ┌───────────────┐  ┌────────────────────┐  ┌───────────────────────┐    │
│ │ Upload/Intake │  │ React Flow Canvas  │  │ Recharts Dashboards   │    │
│ │ (BOM/PDF drop)│  │ (dependency DAG,   │  │ (risk, spend, Scope-3)│    │
│ │               │  │  live risk color)  │  │                        │    │
│ └───────┬───────┘  └─────────┬──────────┘  └───────────┬───────────┘    │
│         │ POST /api/ingest   │ GET /api/supply-chain/:id│ GET /api/risk-state│
└─────────┼────────────────────┼───────────────────────────┼──────────────┘
          ▼                    ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (Next.js Server)                                        │
│ Server Actions / API Routes · TypeScript · Zod validation                │
│ ┌────────────────────┐ ┌─────────────────────┐ ┌──────────────────┐     │
│ │ Ingestion Service   │ │ Disruption Sentinel │ │ Mitigation Engine│     │
│ │ - Parse CSV/XLSX     │ │ - Event feed reader  │ │ - Alt-supplier   │     │
│ │ - LLM extraction     │ │ - Risk scoring (LLM) │ │   matching       │     │
│ │   (PDFs)             │ │ - DAG risk           │ │ - Ranking        │     │
│ │ - Entity resolution   │ │   propagation (CTE)  │ │ - Memo gen       │     │
│ └─────────┬───────────┘ └──────────┬───────────┘ └────────┬──────────┘     │
└───────────┼─────────────────────────┼───────────────────────┼────────────┘
            ▼                         ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ POSTGRESQL (Supabase / Neon)                                              │
│ suppliers · supplier_edges (DAG) · disruption_events · risk_scores        │
│ alternate_suppliers · mitigation_memos · organizations · boms             │
│ Recursive CTEs: tree reconstruction (down) + risk propagation (up)        │
└──────────────────────────────────────────────────────────────────────────┘
          ▲
          │ structured JSON (function-calling / JSON mode)
┌─────────┴──────────────────────────────────────────────────────────────┐
│ AI LAYER — Claude / OpenAI API                                          │
│ 1. BOM/contract structured extraction                                  │
│ 2. Risk-scoring reasoning (event + supplier → probability/severity)    │
│ 3. Mitigation reasoning (alt-supplier selection + memo copy)            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Workflow (Data Flow Narrative)

1. **Upload** — user drops a BOM/invoice (CSV/XLSX primary, PDF stretch).
2. **Extraction** — CSV/XLSX parsed directly into rows; PDFs go through the LLM extraction agent with a strict Zod schema, validated and repaired on failure.
3. **Persist** — rows resolved to supplier nodes, edges written to `supplier_edges`, full DAG reconstructed with a recursive CTE.
4. **Render** — `/api/supply-chain/:orgId` returns `{ nodes, edges }`; React Flow renders it with a tiered auto-layout and highlights single-points-of-failure.
5. **Detect/simulate** — the Sentinel agent triggers a seeded disruption event against a matching supplier.
6. **Score** — the risk-scoring agent produces `{ probability, severity, confidence, rationale }` for that supplier.
7. **Propagate** — a recursive CTE walks the disruption up the DAG (child → parent), attenuating the score per hop, so a Tier-4 event visibly raises risk at Tier-1 and the enterprise node.
8. **Recolor** — the frontend polls `/api/risk-state/:orgId` every 3–5s and recolors nodes gray → amber → red.
9. **Mitigate** — user clicks a red node → the Mitigation Engine ranks alternates and generates a structured Procurement Switch Memo.
10. **Visualize impact** — dashboards update: spend-at-risk, Scope-3 emissions avoided (running counter).

---

## 6. API Endpoints

| Method | Endpoint | Purpose | Notes |
|---|---|---|---|
| `POST` | `/api/ingest` | Upload BOM/invoice (CSV/XLSX/PDF) | CSV/XLSX parsed directly; PDF routed to extraction agent |
| `GET` | `/api/supply-chain/:orgId` | Full DAG as `{ nodes, edges }` | Shaped for direct React Flow consumption |
| `GET` | `/api/risk-state/:orgId` | Current risk score per node | Polled every 3–5s by the frontend |
| `POST` | `/api/disruption/trigger` | Manually or timer-fire a seeded disruption event | Body: `{ supplierId, eventType }`; used for demo control |
| `GET` | `/api/disruption/events` | List seeded/triggered disruption events | For an events log/timeline view if time allows |
| `POST` | `/api/mitigation/:supplierId` | Generate a Procurement Switch Memo for a disrupted supplier | Returns structured JSON; renders as a card |
| `GET` | `/api/alternates/:supplierId` | Candidate alternate suppliers for a given node | Used by the mitigation agent and optionally shown in the side panel |
| `GET` | `/api/dashboard/summary/:orgId` | Aggregate metrics (spend-at-risk, emissions avoided) | Backing data for Recharts |

---

## 7. Data Model

```sql
organizations (id, name, industry)

suppliers (
  id, org_id, name, country, tier INT,
  material_category, certifications TEXT[],
  lat, lng, created_at
)

supplier_edges ( -- the DAG
  id,
  parent_supplier_id REFERENCES suppliers(id), -- downstream / consumer side (closer to finished good)
  child_supplier_id  REFERENCES suppliers(id), -- upstream / raw-material side (supplies into parent)
  component_name, spend_usd, lead_time_days
)

disruption_events (
  id, supplier_id REFERENCES suppliers(id),
  type,               -- flood | sanction | labor_violation | port_closure | ...
  severity FLOAT, source_summary TEXT, source_url,
  triggered_at
)

risk_scores (
  id, supplier_id REFERENCES suppliers(id),
  probability FLOAT, severity FLOAT, confidence FLOAT,
  rationale TEXT, computed_at
)

alternate_suppliers (
  id, replaces_supplier_id REFERENCES suppliers(id),
  name, country, price_index FLOAT, lead_time_days,
  emissions_factor FLOAT, certifications TEXT[]
)

mitigation_memos (
  id, disrupted_supplier_id, alternate_supplier_id,
  price_variance_pct, lead_time_delta_days,
  avoided_scope3_tco2e, compliance_rationale TEXT,
  summary TEXT, generated_at
)
```

**Tree reconstruction (root down through children):**
```sql
WITH RECURSIVE bom_tree AS (
  SELECT id, name, tier, 0 AS depth
  FROM suppliers WHERE id = :root_org_supplier_id
  UNION ALL
  SELECT s.id, s.name, s.tier, bt.depth + 1
  FROM suppliers s
  JOIN supplier_edges e ON e.child_supplier_id = s.id
  JOIN bom_tree bt ON bt.id = e.parent_supplier_id
)
SELECT * FROM bom_tree ORDER BY depth;
```

**Risk propagation (disrupted node up through parents, corrected direction comment):**
```sql
WITH RECURSIVE risk_up AS (
  SELECT supplier_id, probability, severity, 1.0 AS decay
  FROM risk_scores WHERE supplier_id = :disrupted_id
  UNION ALL
  SELECT e.parent_supplier_id, r.probability, r.severity, r.decay * 0.7
  FROM supplier_edges e
  JOIN risk_up r ON r.supplier_id = e.child_supplier_id
)
SELECT supplier_id, MAX(probability * decay) AS propagated_risk
FROM risk_up GROUP BY supplier_id;
```

---

## 8. AI Agent Responsibilities

| Agent | Input | Output (structured JSON) | Notes |
|---|---|---|---|
| Extraction Agent | Raw BOM/PDF text | `{ lineItems: [{ supplierName, country, part, tier, spendUsd }] }` | Zod-validated, retry-on-failure |
| Risk Scoring Agent | Disruption event + supplier metadata | `{ probability, severity, confidence, rationale }` | Low temperature, deterministic-leaning prompt |
| Mitigation Agent | Disrupted supplier + candidate alternates | `{ recommendedAlternateId, priceVariancePct, leadTimeDeltaDays, avoidedScope3Tco2e, rationale, executiveSummary }` | This is the "wow" output — invest in prompt quality |

Keep all three as separate, narrowly-scoped prompts rather than one mega-agent — easier to debug under time pressure, and each maps to one demo beat.

---

## 9. Frontend Guidance

**Visual identity:** aim for the "enterprise command-center" register (Palantir Foundry, Sourcemap), not a generic dashboard template. Dark or high-contrast theme reads as more credible for this kind of tool; avoid default shadcn light-mode-only styling.

**Graph canvas (React Flow):**
- Tiered left-to-right or radial layout via dagre/elkjs — never hand-position nodes.
- Node color is the single most important signal: gray (nominal) → amber (elevated) → red (critical), with a visible transition/pulse when a node changes state, not just a hard color swap.
- SPOF nodes get a distinct treatment (dashed border + badge) so judges spot it without narration.
- Side panel on click, not a modal — keeps the graph visible for spatial context while inspecting a node.

**Dashboards (Recharts):** a running "Scope-3 emissions avoided" counter is worth more than another static bar chart — animate it ticking up when a memo is accepted.

**Mitigation memo:** render it as a formatted card/document, not a raw JSON dump — this is the payoff moment of the demo and should look like something a procurement team would actually receive.

**General:** keep the upload screen's copy tied to the SDG 8/12 framing explicitly, since SDG alignment is a judged criterion, not just a nice narrative close.

---

## 10. Scoring Alignment Checklist

- [ ] Meaningful GitHub commit at the end of each day (not just at the very end)
- [ ] LinkedIn post/update by Wednesday, ideally daily — a short demo clip beats a text update
- [ ] SDG 8/12 framing visible in-product (copy, feature choices), not only in the closing demo line
- [ ] Something concrete ready for tomorrow's team meeting (wireframe/architecture walkthrough is enough)
- [ ] Confirm actual team size/role split with your core-member contact

---

## 11. Risks to the Build Itself

- **PDF extraction flakiness** — CSV/XLSX as the primary demo input; PDF stays a stretch/backup.
- **Real-time infra eating hours** — default to polling; only reach for WebSockets/Realtime if everything else finishes early.
- **Graph auto-layout fighting you** — use dagre early, don't hand-tune positions.
- **LLM structured-output drift** — validate every response with Zod, keep a hardcoded fallback object per call site.
- **Scope creep into real scraping/sanctions APIs** — resist; seeded, well-chosen event data tells the same story with zero uptime risk.
- **Slipping the LinkedIn/commit checkpoints** — these are scored independently of the final demo; don't let build momentum crowd them out.

---

## 12. Demo Script (90–120 seconds)

1. "Manufacturers can see Tier-1. We show them Tier-4." — open on empty upload screen.
2. Drop a sample BOM/invoice → structured extraction happens live → DAG appears.
3. Zoom into the graph: a Tier-3 lithium refiner buried three hops away, flagged as a single point of failure.
4. Trigger a disruption event on that node — watch it flip amber → red, and watch risk climb visibly through Tier-2 and Tier-1 to the enterprise's own product line.
5. Click the red node → "Generate Mitigation Memo" → structured memo appears: alternate supplier, price variance, lead-time impact, avoided Scope-3 emissions.
6. Cut to the dashboard: running "Scope-3 emissions avoided" counter, spend-at-risk chart.
7. Close on the SDG 8 / SDG 12 framing line.
