# VeritasSupply — Project & Agent Guidelines

## 1. Project Overview
**VeritasSupply** is an **Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine**.
- **Mission**: Provide enterprise manufacturers visibility beyond direct Tier-1 suppliers down to Tier-4 raw material nodes (lithium refiners, silicon smelters, cobalt miners, maritime chokepoints).
- **Core Loop**: BOM Ingestion → DAG Construction (Postgres CTEs) → Interactive Command Center (React Flow) → Upstream Disruption Trigger (`[SIMULATE RED SEA BLOCKADE]`) → Risk Propagation (0.7x attenuation up the DAG) → Autonomous Mitigation & Rerouting Engine (Terminal Typewriter Memo + Avoided Scope-3 Emissions).
- **Scoring Anchors**: SDG 8 (Decent Work / Forced Labor Sanctions) and SDG 12 (Responsible Production / Avoided Scope-3 Carbon). Daily GitHub commit cadence.

---

## 2. Team Role Split

### Contributor A (Devansh) — "Data & Backend"
- **Primary Domain**: `backend/` and database/API layers.
- **Responsibilities**:
  1. PostgreSQL relational schema & migrations (Supabase / Neon / Postgres).
  2. Recursive CTE queries:
     - Downward tree reconstruction (`bom_tree`).
     - Upward risk propagation with decay (`risk_up`).
  3. Realistic seed dataset (Chile lithium, DRC cobalt, Xinjiang silicon, Bab-el-Mandeb / Red Sea shipping route, alternate suppliers).
  4. Ingestion pipeline: Native CSV/XLSX parser + LLM structured extraction for invoices/PDFs.
  5. AI Agent endpoints: Risk Scoring Agent and Autonomous Mitigation Engine using low-temperature structured JSON.
  6. Shared TypeScript / Zod validation schemas (`types/supply-chain.ts`).

### Contributor B — "Graph & Frontend"
- **Primary Domain**: `frontend/` and UI/UX layer.
- **Responsibilities**:
  1. Next.js App Router shell + Tailwind CSS + Lucide Icons.
  2. React Flow DAG canvas with tiered auto-layout (Dagre/ELKjs).
  3. Custom dark glassmorphic node cards with color-coded glow states and SPOF hazard badges.
  4. WebGL / Canvas interactive background grid with radar sweep and shockwave effect.
  5. Telemetry Top Bar with running Scope-3 avoided emissions counter and the primary `[SIMULATE RED SEA BLOCKADE]` trigger.
  6. Terminal-typed Procurement Switch Memo card with CRT typewriter effect and `[EXECUTE_REROUTE]` action.
  7. Recharts portfolio dashboards (spend-at-risk by geography, risk exposure over time).

---

## 3. Shared Contract & Architecture Rules

1. **Shared Contract First**:
   - All data exchange between backend and frontend MUST conform to `types/supply-chain.ts`.
   - Neither contributor may alter entity keys without updating the shared Zod schema.
2. **Deterministic LLM Output & Fallbacks**:
   - All AI calls (Extraction, Risk Scoring, Mitigation) must use strict JSON mode validated with Zod.
   - Every agent call MUST have a hardcoded fallback fixture so network timeouts or quota exhaustion never blank the screen during a live demo.
3. **Graph Layout Constraint**:
   - React Flow nodes must NEVER be manually positioned with hardcoded `x, y` offsets. Use Dagre or ELKjs for deterministic tiered hierarchical layout.
4. **Parent-Child DAG Direction**:
   - In `supplier_edges`:
     - `parent_supplier_id`: Downstream consumer / closer to finished good (Tier 0).
     - `child_supplier_id`: Upstream source / component or raw material supplier (Tier N).
   - Tree reconstruction queries run parent → child (downwards).
   - Risk propagation queries run child → parent (upwards with `0.7` decay per hop).

---

## 4. Frontend Aesthetics: Acid Brutalism & Cyberpunk HUD

Contributor B and any agent generating frontend components must follow these design standards:
- **Typography Pairing**:
  - **Display / Headlines**: **Syne** (weight 700/800, tight negative tracking, uppercase, industrial ink traps) or **Clash Display**.
  - **HUD Telemetry / Micro-Labels**: **JetBrains Mono** or **Space Mono** (`[SYS_INIT // 01]`, `[SPOF_DETECTED]`, coordinates, spend, and lead time).
- **Surface Styling**:
  - Deep carbon background (`#07090E` / `#0B0F19`), semi-transparent dark glass cards (`backdrop-blur-md bg-slate-950/70 border border-white/10`).
  - Razor-sharp technical corners with subtle crosshair corner accents.
- **Node States**:
  - **Nominal**: Muted cyan/slate border (`border-cyan-500/30`, text `text-cyan-400`).
  - **Elevated**: Warning amber glow (`border-amber-500/60`, text `text-amber-400`).
  - **Critical / Disrupted**: Pulsing crimson alert (`border-rose-500`, shadow glow `0 0 25px rgba(244,63,94,0.4)`).
  - **SPOF (Single Point of Failure)**: Diagonal hazard stripe border with `[SPOF // BOTTLENECK]` badge.
- **WebGL / Canvas FX**:
  - Background technical coordinate grid with subtle ambient particle drift and a shockwave pulse triggered on disruption events.
- **Terminal Typewriter Memo**:
  - Terminal-style monospace stream with blinking block cursor.
  - Highlights trade-off delta: Price Variance (`+4.2%`), Lead Time (`-3 days`), Avoided Carbon (`-1,420 tCO2e`).

---

## 5. Daily Git Commit Cadence
- In accordance with judging criteria, working code must be committed daily.
- Day 0: Git initialized, shared contracts, architecture docs, clickable HUD wireframe.
- Day 1: End-to-end DAG ingestion + React Flow rendering working.
- Day 2: Disruption Sentinel + Mitigation Memo + LinkedIn demo video clip.
- Day 3: Dashboards polished, 90s backup video recorded, presentation delivery.
