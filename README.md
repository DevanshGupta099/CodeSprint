# VeritasSupply // [TIER-N INTEL ENGINE]

> **Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine.**

[![Live Demo](https://img.shields.io/badge/Production%20App-veritas--supply.vercel.app-00F0FF?style=for-the-badge&logo=vercel&logoColor=white)](https://veritas-supply.vercel.app)
[![API Status](https://img.shields.io/badge/Production%20API-Live%20on%20Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://codesprint-wu6p.onrender.com/api/health)
[![Cloud Database](https://img.shields.io/badge/Cloud%20Database-Neon%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

[![GitHub branch](https://img.shields.io/badge/branch-main-00F0FF?style=flat-square&logo=github)](https://github.com/DevanshGupta099/CodeSprint)
[![Next.js](https://img.shields.io/badge/Next.js-14%2F15%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Recursive%20CTEs-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![React Flow](https://img.shields.io/badge/Graph-React%20Flow%20%2B%20Dagre-FF0072?style=flat-square)](https://reactflow.dev/)
[![Mistral AI](https://img.shields.io/badge/AI%20Engine-Mistral%20AI%20%28Codestral%29-FF7000?style=flat-square)](https://mistral.ai/)
[![Groq](https://img.shields.io/badge/LPU%20Inference-Groq-F55036?style=flat-square)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Reasoning-Google%20Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![OWASP Security](https://img.shields.io/badge/Security-OWASP%20Hardened-00C853?style=flat-square)](https://owasp.org/)
[![SDG 8](https://img.shields.io/badge/SDG%208-Decent%20Work%20%26%20Economic%20Growth-A21942?style=flat-square)](https://sdgs.un.org/goals/goal8)
[![SDG 12](https://img.shields.io/badge/SDG%2012-Responsible%20Production-BF8B2E?style=flat-square)](https://sdgs.un.org/goals/goal12)

---

## 🌐 Live Production Deployments & Cloud Endpoints

The complete system is deployed live in production across high-availability cloud infrastructure:

| Component | Platform | Production URL | Status / Verification |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** (Global CDN) | [https://veritas-supply.vercel.app](https://veritas-supply.vercel.app) | `🟢 HTTP 200 OK` · Next.js 14 App Router |
| **Frontend Mirror** | **Vercel** (Secondary) | [https://code-sprint-delta.vercel.app](https://code-sprint-delta.vercel.app) | `🟢 HTTP 200 OK` · Zero-downtime alias |
| **Backend REST API** | **Render** (Cloud Compute) | [https://codesprint-wu6p.onrender.com](https://codesprint-wu6p.onrender.com) | `🟢 Active` · Express / TypeScript + Python |
| **Cloud Database** | **Neon** (Serverless Postgres) | `br-nameless-river-b3r9pefy` (`production`) | `🟢 Connected` · Recursive CTEs + 7 Relational Tables |

### 🚀 Direct Application Links
- 🖥️ **Landing & Mission Brief**: [https://veritas-supply.vercel.app/](https://veritas-supply.vercel.app/)
- 📊 **Executive Command Center**: [https://veritas-supply.vercel.app/dashboard](https://veritas-supply.vercel.app/dashboard)
- 🕸️ **Interactive DAG Studio**: [https://veritas-supply.vercel.app/graph](https://veritas-supply.vercel.app/graph)

### 🔌 Live Production API Endpoints
- `GET` **Health Check**: [`https://codesprint-wu6p.onrender.com/api/health`](https://codesprint-wu6p.onrender.com/api/health)
- `GET` **Supply Chain DAG**: [`https://codesprint-wu6p.onrender.com/api/supply-chain`](https://codesprint-wu6p.onrender.com/api/supply-chain)
- `GET` **Current Risk State**: [`https://codesprint-wu6p.onrender.com/api/risk-state`](https://codesprint-wu6p.onrender.com/api/risk-state)
- `POST` **Trigger Disruption**: [`https://codesprint-wu6p.onrender.com/api/disruption/trigger`](https://codesprint-wu6p.onrender.com/api/disruption/trigger)
- `GET` **Disruption Scenarios**: [`https://codesprint-wu6p.onrender.com/api/disruption/scenarios`](https://codesprint-wu6p.onrender.com/api/disruption/scenarios)
- `GET` **Portfolio Breakdown**: [`https://codesprint-wu6p.onrender.com/api/analytics/portfolio-breakdown`](https://codesprint-wu6p.onrender.com/api/analytics/portfolio-breakdown)


---

## 1. Executive Summary

Enterprise manufacturers have visibility into their direct **Tier-1** suppliers, but remain virtually blind to deep **Tier-2 through Tier-4 dependencies**. When an upstream event strikes—such as a flash flood at a Tier-3 lithium brine refiner in Chile, forced labor sanctions on a Tier-4 cobalt miner in the DRC, or a maritime chokepoint shutdown at the Bab-el-Mandeb Strait—disruptions remain invisible until Tier-1 assembly lines halt weeks later.

> **"Manufacturers can see Tier-1. We show them Tier-4."**

**VeritasSupply** solves this with an autonomous intelligence loop:

1. **BOM Ingestion & Resolution**: Ingests flat BOMs/invoices and reconstructs deep parent-to-child Directed Acyclic Graphs (DAGs) in PostgreSQL.
2. **Interactive Command Center**: High-contrast, Acid Brutalist / Cyberpunk HUD visualizer powered by React Flow, Dagre tiered layout, and dark glassmorphic telemetry cards.
3. **Disruption Sentinel**: Simulates or detects geopolitical blockades and environmental hazards on upstream nodes via low-temperature structured AI reasoning.
4. **Recursive Risk Propagation**: Dynamically attenuates risk scores by 30% (`* 0.7`) per hop, visibly traveling from Tier-4/3 suppliers up to the Tier-0 enterprise finished good.
5. **Autonomous Mitigation & Rerouting Engine**: Evaluates pre-vetted alternate suppliers, balances price vs. lead time, and synthesizes a CRT terminal-typed **Procurement Switch Memo** featuring live avoided Scope-3 emissions metrics.

---

## 2. System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                                       │
│ Next.js App Router · Tailwind CSS · React Flow · Recharts              │
│ ┌───────────────┐   ┌─────────────────────┐   ┌──────────────────────┐ │
│ │ BOM Dropzone  │   │ React Flow Canvas   │   │ Telemetry Top Bar    │ │
│ │ (CSV / PDF)   │   │ (DAG, SPOF Badges,  │   │ (Scope-3 Avoided CO2,│ │
│ │               │   │  Glow States)       │   │  [RED SEA BLOCKADE]) │ │
│ └───────┬───────┘   └──────────┬──────────┘   └──────────┬───────────┘ │
└─────────┼──────────────────────┼─────────────────────────┼─────────────┘
          │ POST /api/ingest     │ GET /api/supply-chain   │ GET /api/risk-state (3-5s poll)
          ▼                      ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (Next.js Server Actions / API Routes / Node.js)      │
│ TypeScript · Zod Validation · Sliding-Window Rate Limiting · OWASP     │
│ ┌───────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │ Ingestion Service │ │ Disruption Sentinel  │ │ Mitigation Engine   │ │
│ │ CSV parser +      │ │ Event trigger +      │ │ Alternate ranking + │ │
│ │ AI extraction     │ │ CTE risk propagation │ │ Switch memo writer  │ │
│ └─────────┬─────────┘ └──────────┬───────────┘ └──────────┬──────────┘ │
└───────────┼──────────────────────┼────────────────────────┼────────────┘
            ▼                      ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│ POSTGRESQL (Supabase / Neon / Local Postgres)                          │
│ Tables: organizations, suppliers, supplier_edges, disruption_events,   │
│         risk_scores, alternate_suppliers, mitigation_memos            │
│ Core: Recursive CTEs for DAG traversal and risk attenuation            │
└────────────────────────────────────────────────────────────────────────┘
            ▲
            │ Multi-Provider Cascading Fallback (Mistral -> Groq -> Gemini -> Offline CTE)
┌───────────┴────────────────────────────────────────────────────────────┐
│ AI LAYER (Multi-Provider Resilience Engine)                            │
│ 1. Primary: Mistral AI (codestral-latest / ministral-8b-latest)        │
│ 2. High-Speed LPU: Groq (openai/gpt-oss-120b / qwen3.8-27b)           │
│ 3. Deep Reasoning: Google Gemini (gemini-3.5-flash-lite / 3.6-flash)   │
│ 4. Guaranteed Offline Fallback: Deterministic Postgres Knowledge Fixt. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Visual Identity: Acid Brutalism & Cyberpunk HUD

VeritasSupply uses an **Acid Brutalist / Cyberpunk Command Center** visual design:

- **Typography Pairing**:
  - **Display / Headlines**: **`Syne`** (weights 700/800, tight negative tracking `-0.04em`, uppercase, ink traps).
  - **HUD Telemetry / Micro-labels**: **`JetBrains Mono`** and **`Space Mono`** for bracketed metadata `[SYS_INIT // 01]`, coordinate tags `[LAT: 12.59 // LNG: 43.32]`, and metrics.
- **Surface Styling**: Deep carbon background (`#07090E`), semi-transparent dark glass cards (`backdrop-blur-md bg-slate-950/70 border border-white/10`), and razor-sharp technical corner accents.
- **Color Glow States**:
  - **Nominal**: Muted cyan/slate border (`border-cyan-500/30`, text `text-cyan-400`).
  - **Elevated Risk**: Caution amber glow (`border-amber-500/60`, text `text-amber-400`).
  - **Critical / Disrupted**: Pulsing crimson alert (`border-rose-500`, shadow glow `0 0 25px rgba(244,63,94,0.4)`).
  - **SPOF (Single Point of Failure)**: Diagonal hazard stripe border with `[SPOF // BOTTLENECK]` badge.
- **WebGL / Canvas FX**: Interactive background coordinate grid with radar sweep and shockwave pulse upon disruption.
- **Terminal Typewriter Memo**: Monospace typewriter animation outputting trade-off metrics (Price Variance `+4.2%`, Lead Time `-3 days`, Avoided Carbon `-1,420 tCO2e`).

---

## 4. Team Roles & Architecture Split

The codebase enforces a decoupled boundary through a **Shared Data Contract** ([types/supply-chain.ts](file:///c:/Users/Devansh/Downloads/CodeSprint/frontend/src/types/supply-chain.ts)):

| Track | Lead Contributor | Core Responsibilities |
| :--- | :--- | :--- |
| **Data & Backend** | **Contributor A (Devansh)** | PostgreSQL schema, DDL migrations, recursive CTEs (`bom_tree` & `risk_up`), ingestion engine, Disruption Sentinel, Mitigation AI agents, seed dataset. |
| **Graph & Frontend** | **Contributor B (Sundar)** | Next.js App Router shell, Tailwind CSS, React Flow DAG canvas, WebGL coordinate grid canvas, `[SIMULATE RED SEA BLOCKADE]` trigger bar, terminal memo, Recharts dashboards. |

---

## 5. Core Recursive Algorithms

### 1. Downward Tree Reconstruction (PostgreSQL CTE)

Reconstructs the hierarchical N-tier tree starting from the enterprise node down to raw materials:

```sql
WITH RECURSIVE bom_tree AS (
  SELECT id, name, country, tier, material_category, 0 AS depth
  FROM suppliers 
  WHERE id = :root_supplier_id
  
  UNION ALL
  
  SELECT s.id, s.name, s.country, s.tier, s.material_category, bt.depth + 1
  FROM suppliers s
  JOIN supplier_edges e ON e.child_supplier_id = s.id
  JOIN bom_tree bt ON bt.id = e.parent_supplier_id
)
SELECT * FROM bom_tree ORDER BY depth;
```

### 2. Upward Risk Propagation with 0.7x Attenuation

When an upstream supplier is disrupted, risk climbs upward to its downstream consumers, decaying by 30% per hop:

```sql
WITH RECURSIVE risk_up AS (
  SELECT 
    supplier_id, probability, severity, 1.0 AS decay,
    (probability * severity) AS current_impact
  FROM risk_scores 
  WHERE supplier_id = :disrupted_supplier_id
  
  UNION ALL
  
  SELECT 
    e.parent_supplier_id AS supplier_id,
    r.probability, r.severity, r.decay * 0.7 AS decay,
    (r.probability * r.severity * (r.decay * 0.7)) AS current_impact
  FROM supplier_edges e
  JOIN risk_up r ON r.supplier_id = e.child_supplier_id
)
SELECT supplier_id, ROUND(MAX(current_impact)::numeric, 3) AS propagated_risk_score
FROM risk_up 
GROUP BY supplier_id;
```

---

## 6. Repository Structure

```text
CodeSprint/
├── .agents/                                # Antigravity Customizations & Runbooks
│   └── skills/
│       ├── backend-data-sentinel/          # Contributor A (Devansh) Skill
│       │   └── SKILL.md
│       └── frontend-webgl-command-center/  # Contributor B Skill
│           └── SKILL.md
├── AGENTS.md                               # Project Rules & Style Guidelines
├── backend/
│   ├── db/
│   │   ├── schema.sql                      # PostgreSQL DDL
│   │   └── seed.sql                        # EV Battery Supply Chain Seed Data
│   ├── python/                             # Python Intelligence Stack (FastAPI + NetworkX)
│   │   ├── app/
│   │   │   ├── db/                         # Threaded Pool & Recursive CTE Queries
│   │   │   ├── models/                     # Pydantic v2 Schemas (Strict Data Contracts)
│   │   │   ├── services/                   # NetworkX Graph Analytics, AI Sentinel, Mitigation
│   │   │   └── main.py                     # FastAPI Application & OpenAPI Docs
│   │   ├── tests/                          # Pytest Suite (100% Passing)
│   │   └── run_server.py                   # Python Server Runner (Port 8000)
│   ├── src/                                # Node.js / TypeScript Stack (Express)
│   │   ├── db/                             # Pool & Recursive CTE Queries
│   │   ├── middleware/                     # Validation Middleware (UUID, Zod)
│   │   ├── services/                       # Sentinel, Mitigation, Ingestion
│   │   ├── types/                          # Shared TypeScript / Zod Contracts
│   │   └── server.ts                       # Express REST Server (Port 5000)
│   ├── test/                               # Security & CTE Test Suites
│   ├── package.json
│   └── requirements.txt                    # Python Dependencies (FastAPI, NetworkX, Psycopg2)
├── docs/
│   ├── Contributor_A_Data_and_Backend_Guide.md
│   ├── Contributor_B_Frontend_and_WebGL_Guide.md
│   ├── Shared_Data_Contracts.md
│   ├── VeritasSupply_Corrected_Implementation_Plan.md
│   └── VeritasSupply_Project_Plan_and_Architecture.md
├── frontend/
│   └── src/
│       └── types/
│           └── supply-chain.ts             # Frontend TypeScript & Zod schemas
├── .gitignore
└── README.md
```

---

## 6. Multi-Provider AI Engine & Zero-Downtime Cascades

VeritasSupply is architected for enterprise-grade high availability. AI operations (Disruption Sentinel, Procurement Mitigation Memos, and Copilot Chat) do not rely on a single vulnerable model endpoint. Instead, the engine implements a **4-tier cascading failover**:

```text
┌────────────────────────────────────────────────────────┐
│ USER / SIMULATION DISRUPTION TRIGGER                   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ TIER 1: MISTRAL AI (Primary High-Fidelity Engine)      │
│ Model: codestral-latest / ministral-8b-latest          │
│ Latency: ~2.3s · 100% strict JSON schema conformity    │
└──────────────────────────┬─────────────────────────────┘
                           │ (429 Rate Limit / Timeout >6s)
                           ▼
┌────────────────────────────────────────────────────────┐
│ TIER 2: GROQ LPU INFERENCE (High-Throughput Fallback)  │
│ Models: openai/gpt-oss-120b / qwen/qwen3.8-27b         │
│ Latency: ~210ms - 980ms · Sub-second execution         │
└──────────────────────────┬─────────────────────────────┘
                           │ (429 Rate Limit / Quota Spikes)
                           ▼
┌────────────────────────────────────────────────────────┐
│ TIER 3: GOOGLE GEMINI (Deep Reasoning Fallback)        │
│ Models: gemini-3.5-flash-lite / gemini-3.6-flash       │
│ Latency: ~2.6s · High free-tier allowance              │
└──────────────────────────┬─────────────────────────────┘
                           │ (Total Network / API Outage)
                           ▼
┌────────────────────────────────────────────────────────┐
│ TIER 4: DETERMINISTIC KNOWLEDGE GRAPH FIXTURES         │
│ Low-latency offline PostgreSQL CTE data & heuristics   │
│ Latency: <1ms · 100% Guaranteed Uptime in Demos        │
└────────────────────────────────────────────────────────┘
```

### Key AI Grounding Metrics:
- **UN SDG 8 (Decent Work & Economic Growth)**: Screened against UFLPA (Uyghur Forced Labor Prevention Act) Section 307 and international maritime seafarer safety protocols.
- **UN SDG 12 (Responsible Consumption & Production)**: Quantifies avoided Scope-3 emissions ($\text{tCO}_2\text{e}$) achieved by transitioning from coal-heavy smelters or heavy-bunker shipping lanes to hydro-electric smelting and certified green corridors.

---

## 7. Enterprise Security Hardening & Threat Protection

All public-facing API routes in the Node.js backend and Next.js Edge handlers are safeguarded against abuse, denial-of-service, and credential exposure:

1. **Sliding-Window IP Rate Limiting**:
   - **General Read Endpoints** (`GET /api/supply-chain`, `/api/health`, `/api/risk-state`): Limited to **120 requests/minute** per IP.
   - **Sensitive Mutation & AI Endpoints** (`POST /api/disruption/trigger`, `/api/mitigation/*`, `/api/ai/copilot`): Restricted to **30 requests/minute** per IP with automated garbage collection every 2 minutes.
2. **OWASP HTTP Security Headers**:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)
   - `X-Content-Type-Options: nosniff` (MIME sniffing defense)
   - `X-Frame-Options: DENY` (Clickjacking prevention)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
3. **Prompt Injection & Payload Bloat Protection**:
   - Input queries are capped at **1,500 characters** to prevent denial-of-wallet prompt-bloat attacks.
   - Non-printable ASCII control characters (`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`) are automatically stripped before reaching LLMs.
4. **Dynamic Whitelisted CORS**:
   - Explicit whitelist restricting access to production domains (`veritas-supply.vercel.app`), Vercel preview environments (`*.vercel.app`), and local development environments.
5. **Sanitized Production Error Handling**:
   - Internal PostgreSQL schema traces, table names, and connection strings are masked behind generic error responses in production to prevent intelligence reconnaissance.

---

## 8. Production Deployment & Cloud Environment Setup

### A. Frontend on Vercel (`veritas-supply.vercel.app`)

1. Open your **Vercel Dashboard** $\rightarrow$ select `veritas-supply`.
2. Navigate to **Settings** $\rightarrow$ **Environment Variables**.
3. Add the following keys across all environments (Production, Preview, Development):

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend URL: `https://codesprint-wu6p.onrender.com` |
| `MISTRAL_API_KEY` | Mistral AI key for primary Copilot reasoning |
| `GROQ_API_KEY` | Groq API key for sub-second LPU fallback |
| `GEMINI_API_KEY` | Google Gemini key for deep reasoning fallback |

4. Trigger a zero-downtime redeploy under **Deployments** $\rightarrow$ **Redeploy**.

### B. Backend on Render (`codesprint-wu6p.onrender.com`)

1. Open your **Render Dashboard** $\rightarrow$ select `codesprint-wu6p`.
2. Navigate to the **Environment** tab.
3. Add / update the following variables:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-....neon.tech/neondb?sslmode=require
ALLOWED_ORIGINS=https://veritas-supply.vercel.app,http://localhost:3000
MISTRAL_API_KEY=your_mistral_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Click **Save Changes**. Render will perform an automated rolling zero-downtime restart.

---

## 9. Quickstart Guide

### Prerequisites

- **Node.js**: v18.0.0+ (Tested on v24.4.0)
- **Python**: v3.10+ (Tested on Python 3.14.7)
- **PostgreSQL**: v14+ (Local, Supabase, or Neon)
- **Package Manager**: npm or pnpm

### 1. Clone & Install

```bash
git clone https://github.com/DevanshGupta099/CodeSprint.git
cd CodeSprint
```

### 2. Configure Environment

Copy template files and supply your database and AI keys:

```bash
# Root & Backend
cp .env.example .env
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Database Migration & Seed

Run SQL DDL and seed scripts to initialize the database:

```bash
psql -U postgres -h localhost -d veritassupply -f backend/db/schema.sql
psql -U postgres -h localhost -d veritassupply -f backend/db/seed.sql
```

### 4. Run Node.js Backend & Security Test Suite

```bash
cd backend
npm install
npm run dev

# Run automated Security & Edge Case test suite (16/16 passing)
npm test
```

### 5. Run Python Intelligence Engine (FastAPI + NetworkX)

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt

# Start Python API (Port 8000, Interactive docs at http://localhost:8000/docs)
npm run start:python

# Run Pytest test suite (9/9 passing)
npm run test:python
```

### 6. Run Frontend Command Center (Next.js)

```bash
cd frontend
npm install
npm run dev

# Interactive HUD available at http://localhost:3000
```

---

## 10. Development Cadence & Milestones

- **Day 0 (Foundation)**: Git initialization, shared contracts, architecture walkthrough, and clickable wireframe.
- **Day 1 (Team Meeting)**: Live BOM upload → DAG construction in PostgreSQL → React Flow rendering.
- **Day 2 (Disruption Sentinel & LinkedIn Video)**: Disruption trigger + recursive risk propagation + terminal memo generation + LinkedIn demo clip.
- **Day 3 (Polish & Multi-Provider AI Hardening)**: Mistral + Groq + Gemini multi-provider failover, OWASP security middleware, rate limiting, and final deployment.

---

## 11. License

This project is built for the CodeSprint Hackathon under the **MIT License**.

