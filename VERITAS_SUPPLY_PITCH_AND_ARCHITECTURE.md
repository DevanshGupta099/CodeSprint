# VeritasSupply — Executive Pitch, System Architecture & Presentation Runbook

> **Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine**  
> *Targeting UN SDG 8 (Decent Work & Forced Labor Sanctions) and UN SDG 12 (Responsible Production & Avoided Scope-3 Carbon).*

---

## 1. Executive Summary & Problem Statement

### The Multi-Billion Dollar Blindspot
Modern enterprise OEMs (automotive, aerospace, defense, semiconductors) manage direct relationships with **Tier-1 suppliers** (e.g., Bosch, Panasonic, tier-1 module integrators). However, **over 80% of systemic disruptions originate deep in Tier-3 and Tier-4 upstream nodes**:
- **Geopolitical Bottlenecks**: Maritime chokepoints (Bab-el-Mandeb / Red Sea, Strait of Malacca, Suez Canal).
- **Sanctions & Labor Violations**: Forced labor compliance under the **Uyghur Forced Labor Prevention Act (UFLPA)** in polysilicon refining, or conflict minerals in DRC Katanga cobalt extraction.
- **Single Points of Failure (SPOFs)**: Monopolistic processors (e.g., Odesa high-purity laser neon gas refiners for semiconductor photolithography).

### The VeritasSupply Solution
**VeritasSupply** is an autonomous intelligence platform that:
1. **Ingests Enterprise BOMs & Invoices** (via native CSV parsers and multi-LLM multimodal extraction).
2. **Reconstructs Tier-N Directed Acyclic Graphs (DAG)** using PostgreSQL Recursive Common Table Expressions (CTEs).
3. **Detects SPOFs & Critical Bridges** using articulation point graph algorithms.
4. **Simulates Geopolitical & Environmental Shocks** (e.g., Red Sea Blockade, Black Sea Corridor Closure, Taiwan Strait Stoppage).
5. **Propagates Risk Waves Upstream** with a calibrated $0.7\times$ attenuation decay model.
6. **Synthesizes Autonomous Mitigation Directives** using low-temperature structured LLM reasoning, evaluating trade-off deltas (Price Variance, Lead Time, and Avoided Scope-3 Carbon).
7. **Executes Closed-Loop Rerouting** in real-time, rewiring the relational DAG and restoring downstream manufacturing to nominal state.

---

## 2. Core Architecture & Tech Stack

```
                                    +-------------------------------------------------------+
                                    |                ENTERPRISE INGESTION                  |
                                    |     BOM CSV / XLSX / PDF Invoices / ERP Exports       |
                                    +-------------------------------------------------------+
                                                               |
                                                               v
                                    +-------------------------------------------------------+
                                    |            HYBRID INGESTION ENGINE                    |
                                    |  Fast CSV Streamer  +  Multi-LLM Structured Extractor  |
                                    |  (Gemini 2.5 Flash / Groq Llama-3 / Mistral / Codestral) |
                                    +-------------------------------------------------------+
                                                               |
                                                               v
                                    +-------------------------------------------------------+
                                    |             RELATIONAL DAG & CTEs (Neon DB)           |
                                    |   - Downward bom_tree (Parent -> Child traversal)     |
                                    |   - Upward risk_up (0.7x decay risk wave propagation)  |
                                    |   - Articulation Point SPOF & Bridge Detection        |
                                    +-------------------------------------------------------+
                                           |                                       |
                                           v                                       v
        +-----------------------------------------------------+  +------------------------------------------------------+
        |      FRONTEND CYBERPUNK HUD (Next.js 14)            |  |         AUTONOMOUS MITIGATION SENTINEL               |
        |  - React Flow DAG Canvas (Dagre tiered auto-layout) |  |  - Low-temp JSON structured trade-off synthesizer    |
        |  - Three.js WebGL radar sweep & shockwave pulse     |  |  - Avoided Scope-3 Carbon Calculator (tCO2e)         |
        |  - Acid Brutalist HUD telemetry (Syne + Space Mono) |  |  - Closed-Loop DAG Rewiring Engine                   |
        +-----------------------------------------------------+  +------------------------------------------------------+
```

### Component Details
- **Frontend**: Next.js 14 (App Router), React Flow (`@xyflow/react`), Dagre layout engine, Three.js WebGL canvas, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Zod schema validation, Multer file upload parsing, Rate-limiting & OWASP security headers.
- **Database**: Serverless PostgreSQL on **Neon**, featuring recursive CTEs, UUID foreign key constraints, and multi-tenant org partitioning.
- **AI Models & LLM Gateway**: Gemini 2.5 Flash, Groq (Llama 3.3 70B Versatile), Mistral / Codestral, Cerebras, OpenRouter fallback ladder.

---

## 3. What the 3 BOM/PDF Files in the Project Do

The repository includes 3 production-grade reference BOMs in `backend/data/` and `frontend/public/sample-boms/`:

| Dataset / File | Industry / Finish Product | Upstream Chokepoint (Tier-4 / Tier-3) | Disruption Scenario |
|---|---|---|---|
| **1. EV Battery Pack** (`ev_battery_pack_bom.csv / .pdf`) | Automotive 900V Battery Pack | Katanga Cobalt Basin (DRC) & Bab-el-Mandeb Maritime Corridor | **Red Sea Blockade** (Houthis / maritime stoppage). Attenuates up through lithium cathodes to vehicle assembly. |
| **2. Aerospace Satellite** (`aerospace_satellite_bom.csv / .pdf`) | Low-Earth Orbit Satellite Bus | Malacca Strait titanium shipping & Singapore heavy freight | **Strait of Malacca Stoppage**. Propagates through reaction wheels and thrusters. |
| **3. Semiconductor MCU** (`semiconductor_mcu_bom.csv / .pdf`) | 28nm Automotive Microcontroller | Odesa High-Purity Neon Gas Refiners (Black Sea) | **Black Sea Embargo**. Propagates through photolithography excimer lasers to wafer fab. |

### How They Are Processed
1. **Drag-and-Drop Ingestion**: The user uploads any BOM CSV or PDF via the top-bar modal.
2. **Native Fast Parser**: If it's a CSV, `csv-parser` validates columns (`tier`, `supplier_name`, `component`, `country`, `spend`, `lead_time`).
3. **Multimodal LLM Parser**: If it's a PDF invoice or unformatted text, the file buffer is passed to the AI Extraction Engine (Gemini / Groq), which outputs strict JSON adhering to `IngestedBOMSchema`.
4. **Relational Ingestion**: The backend creates or updates `suppliers` and `supplier_edges` records in Neon, computing graph tiers from 0 to 4.
5. **Instant Canvas Re-render**: The React Flow graph re-lays out automatically using Dagre, visualizing the newly imported supply chain.

---

## 4. Live Presentation Demo Guide (Under 3 Minutes)

### Step 1: Establish the Baseline (0:00 - 0:45)
- Open the live URL: `https://codesprint-wu6p.onrender.com/graph` (or your local / deployed frontend).
- Point out the **Acid Brutalist / Cyberpunk HUD**:
  - Telemetry bar showing **Live Scope-3 Avoided Carbon Counter**.
  - Tiered hierarchical DAG layout (Tier 0 assembly on the left, Tier 4 raw extraction on the right).
  - Green/Cyan **NOMINAL** status across all nodes.
  - Notice the **[SPOF // BOTTLENECK]** hazard badge on high-centrality bridge nodes.

### Step 2: Trigger the Shock Wave (0:45 - 1:30)
- Click the glowing crimson button: **`[SIMULATE RED SEA BLOCKADE]`** (or select another scenario from the dropdown).
- **Observe the immediate cascade**:
  1. The WebGL canvas triggers a crimson radial shockwave.
  2. The Tier-4 logistics chokepoint pulses into **CRITICAL** alert (`0.95` risk score).
  3. The PostgreSQL recursive CTE propagates the risk upward:
     - Tier-3 smelters receive $0.95 \times 0.7 = 0.66$ (ELEVATED amber glow).
     - Tier-2 component makers receive $0.66 \times 0.7 = 0.46$ (ELEVATED).
     - Tier-1 module builders receive $0.46 \times 0.7 = 0.32$ (NOMINAL/ELEVATED boundary).
  4. Spend-at-Risk metric immediately shoots up on the top telemetry bar.

### Step 3: The Autonomous Mitigation Directive (1:30 - 2:15)
- Point to the CRT typewriter terminal card that emerges: **"AUTONOMOUS PROCUREMENT DIRECTIVE"**.
- Highlight the **multi-objective trade-off delta**:
  - **Price Variance**: $+4.2\%$ spot cost.
  - **Lead Time Delta**: $-3$ days transit via Cape of Good Hope alternate corridor.
  - **Avoided Scope-3 Carbon**: $+1,420.5 \text{ tCO}_2\text{e}$ (bypassing unvetted heavy fuel oil).
  - **UN SDG Anchors**: Full compliance with **SDG 8** (Decent Work / ILO crew safety) and **SDG 12** (Responsible Production).

### Step 4: Closed-Loop Reroute Execution (2:15 - 2:45)
- Click the button: **`[EXECUTE_REROUTE]`**.
- Observe the closed-loop recovery:
  1. The disrupted node is bypassed.
  2. The alternate supplier (*Nordic Horn Maritime Lines*) is inserted into the DAG.
  3. Edges are rewired in PostgreSQL.
  4. The upstream risk cascade collapses back to **NOMINAL (0.05)**.
  5. The global **Avoided Scope-3 Emissions** counter updates.

### Step 5: Custom Demo BOM Upload (2:45 - 3:00)
- Click **`[INGEST BOM]`** in the top bar.
- Upload the custom file: `Veritas_900V_Powertrain_Demo_BOM.csv` (or `.pdf`).
- Watch the DAG dynamically rebuild with the new powertrain component hierarchy in real-time.

---

## 5. Scoring Anchors & Judging Criteria Mapping

| Judging Pillar | How VeritasSupply Delivers |
|---|---|
| **Technical Complexity & Architecture** | Recursive CTE queries in PostgreSQL on Neon, deterministic DAG auto-layout with Dagre, Three.js WebGL shaders, strict Zod contracts. |
| **UN SDG 8 (Decent Work & Economic Growth)** | Automated screening against forced labor risk (UFLPA), child labor in cobalt extraction, and maritime crew safety under ILO MLC 2006. |
| **UN SDG 12 (Responsible Consumption & Production)** | Real-time calculation of avoided Scope-3 emissions ($\text{tCO}_2\text{e}$) when switching from dirty emergency air-freight to certified low-carbon routes. |
| **User Experience & Innovation** | High-density Cyberpunk HUD, CRT typewriter terminal memo, radial shockwave animations, zero-crash fallback guarantees. |
| **Resilience & Production Hardening** | Low-temperature structured JSON mode, fallback AI ladders (Gemini $\to$ Groq $\to$ Mistral), sanitized input validation, OWASP security headers. |
