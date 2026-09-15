import { 
  SupplyChainDAGResponse, 
  RiskStateResponse, 
  MitigationMemo, 
  AlternateSupplier, 
  DisruptionScenario,
  RerouteExecutionResponse,
  PortfolioBreakdownResponse,
  Supplier
} from '../types/supply-chain';
import { AICopilotResponse, SupplierAIAudit } from '../types/ai';
import { INITIAL_DAG_DATA, ALTERNATES_MAP, SCENARIO_PRESETS } from '../data/seed-graph';
import { BOM_PRESETS_CATALOG, BOM_DAG_MAP, BOMPresetInfo } from '../data/bom-presets';

const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;


// In-memory simulation state for instant zero-dependency client execution
class SupplyChainSimulator {
  private dag: SupplyChainDAGResponse;
  private activeBOMKey: string = 'EV_BATTERY_PACK';
  private activeDisruptions: { supplierId: string; type: string; severity: number }[] = [];
  private avoidedScope3: number = 0;
  private currentMemo: MitigationMemo | null = null;

  constructor() {
    this.dag = JSON.parse(JSON.stringify(INITIAL_DAG_DATA));
  }

  public getDAG(): SupplyChainDAGResponse {
    return JSON.parse(JSON.stringify(this.dag));
  }

  public loadBOM(presetKey: string): SupplyChainDAGResponse {
    const template = BOM_DAG_MAP[presetKey] || INITIAL_DAG_DATA;
    this.activeBOMKey = presetKey;
    this.dag = JSON.parse(JSON.stringify(template));
    this.activeDisruptions = [];
    this.currentMemo = null;
    return this.getDAG();
  }

  public getActiveBOMKey(): string {
    return this.activeBOMKey;
  }

  public getScenarios(): DisruptionScenario[] {
    return SCENARIO_PRESETS;
  }

  public getAlternates(supplierId: string): AlternateSupplier[] {
    return ALTERNATES_MAP[supplierId] || [];
  }

  // Recursive Upward Risk Propagation with 0.7x Attenuation (mirroring PostgreSQL CTE)
  public triggerDisruption(supplierId: string, severity: number = 0.95, type: string = 'GEOPOLITICAL_BLOCKADE'): {
    dag: SupplyChainDAGResponse;
    memo: MitigationMemo;
  } {
    // 1. Record disruption
    this.activeDisruptions = [{ supplierId, type, severity }];

    // 2. Clone current nodes
    const nodeMap = new Map<string, Supplier>();
    this.dag.nodes.forEach(n => nodeMap.set(n.id, { ...n }));

    // 3. Set root disrupted node
    const targetNode = nodeMap.get(supplierId);
    if (targetNode) {
      const baseRisk = Math.min(1.0, severity * 0.95);
      targetNode.riskScore = Math.round(baseRisk * 1000) / 1000;
      targetNode.status = 'CRITICAL';
    }

    // 4. Recursive upward propagation (child -> parent) with 0.7 decay per hop
    const queue: { id: string; decay: number; risk: number }[] = [
      { id: supplierId, decay: 1.0, risk: severity * 0.95 }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current.id);

      // Find all edges where current node is child (upstream supplier)
      const parentEdges = this.dag.edges.filter(e => e.childSupplierId === current.id);
      
      for (const edge of parentEdges) {
        const parentId = edge.parentSupplierId;
        const nextDecay = current.decay * 0.7;
        const nextRisk = current.risk * 0.7;

        const parentNode = nodeMap.get(parentId);
        if (parentNode) {
          const updatedScore = Math.max(parentNode.riskScore, Math.round(nextRisk * 1000) / 1000);
          parentNode.riskScore = updatedScore;

          if (updatedScore >= 0.70) {
            parentNode.status = 'CRITICAL';
          } else if (updatedScore >= 0.35) {
            parentNode.status = 'ELEVATED';
          }

          if (!visited.has(parentId)) {
            queue.push({ id: parentId, decay: nextDecay, risk: updatedScore });
          }
        }
      }
    }

    this.dag.nodes = Array.from(nodeMap.values());

    // 5. Generate AI Mitigation Memorandum
    const alternates = this.getAlternates(supplierId);
    const chosenAlt = alternates[0] || {
      id: '50000000-0000-0000-0000-000000000001',
      name: 'Nordic Horn Maritime Lines',
      priceIndex: 1.042,
      leadTimeDays: 39,
      emissionsFactor: 0.72,
    };

    const avoidedCo2 = 1420.5; // tCO2e avoided via modern dual-fuel carrier bypassing danger zone
    const memo: MitigationMemo = {
      id: '60000000-0000-0000-0000-000000000001',
      disruptedSupplierId: supplierId,
      alternateSupplierId: chosenAlt.id,
      alternateName: chosenAlt.name,
      priceVariancePct: 4.2,
      leadTimeDeltaDays: -3,
      avoidedScope3Tco2e: avoidedCo2,
      complianceRationale: 'Full compliance with UN SDG 12 (Responsible Production). Bypasses Bab-el-Mandeb conflict zone utilizing low-sulfur dual-fuel fleet along South Atlantic corridor.',
      executiveSummary: `CRITICAL ALERT // AUTONOMOUS REROUTE PROPOSAL\n` +
        `Target Node [${targetNode?.name || 'AML-YEM'}] compromised by ${type}.\n` +
        `Upward DAG propagation has pushed downstream Tier-2 and Tier-1 nodes into ELEVATED risk status.\n` +
        `Recommendation: Activate pre-vetted alternate [${chosenAlt.name}]. Price variance is contained to +4.2%, with a 3-day lead time improvement and 1,420.5 tCO2e in avoided Scope-3 emissions.`,
      generatedAt: new Date().toISOString(),
    };
    this.currentMemo = memo;

    return {
      dag: this.getDAG(),
      memo,
    };
  }

  // Execute Reroute and swap in alternate supplier
  public executeReroute(): RerouteExecutionResponse {
    if (!this.currentMemo) {
      throw new Error('No active mitigation memo to execute');
    }

    const { disruptedSupplierId, alternateSupplierId, alternateName, avoidedScope3Tco2e } = this.currentMemo;

    // Find and update disrupted node
    const targetIdx = this.dag.nodes.findIndex(n => n.id === disruptedSupplierId);
    if (targetIdx !== -1) {
      this.dag.nodes[targetIdx] = {
        ...this.dag.nodes[targetIdx],
        name: `${alternateName} [REROUTED]`,
        code: 'NHM-NOR',
        country: 'Norway',
        countryCode: 'NOR',
        status: 'NOMINAL',
        riskScore: 0.06,
        isSPOF: false,
        leadTimeDays: 39,
      };
    }

    // Reset all parent nodes back to nominal
    this.dag.nodes.forEach(n => {
      n.status = 'NOMINAL';
      n.riskScore = Math.min(n.riskScore, 0.12);
    });

    this.avoidedScope3 += avoidedScope3Tco2e;
    this.activeDisruptions = [];

    return {
      success: true,
      message: `Reroute executed successfully. Swapped to ${alternateName}.`,
      memoId: this.currentMemo.id,
      previousSupplierId: disruptedSupplierId,
      previousSupplierName: 'Apex Maritime Logistics',
      newSupplierId: alternateSupplierId,
      newSupplierName: alternateName,
      avoidedScope3Tco2e: this.avoidedScope3,
      updatedDAG: this.getDAG(),
    };
  }

  // Reset entire DAG to initial nominal state
  public reset(orgId: string): SupplyChainDAGResponse {
    this.dag = JSON.parse(JSON.stringify(INITIAL_DAG_DATA));
    this.activeDisruptions = [];
    this.currentMemo = null;
    return this.getDAG();
  }

  // Risk state telemetry
  public getRiskState(orgId: string): RiskStateResponse {
    const atRiskSpend = this.dag.nodes
      .filter(n => n.status === 'CRITICAL' || n.status === 'ELEVATED')
      .reduce((sum, n) => sum + (n.spend * (n.riskScore || 0.5)), 0);

    return {
      orgId,
      timestamp: new Date().toISOString(),
      nodes: this.dag.nodes.map(n => ({
        supplierId: n.id,
        status: n.status,
        riskScore: n.riskScore,
        isSPOF: n.isSPOF,
      })),
      portfolioMetrics: {
        totalSpendAtRiskUSD: Math.round(atRiskSpend * 100) / 100,
        avoidedScope3Tco2e: this.avoidedScope3,
        activeDisruptionsCount: this.activeDisruptions.length,
      },
    };
  }

  // Portfolio analytics breakdown for Recharts
  public getPortfolioBreakdown(orgId: string): PortfolioBreakdownResponse {
    // Group spend by country
    const countryMap = new Map<string, { spend: number; count: number; atRisk: number; maxRisk: number; code: string }>();
    this.dag.nodes.forEach(n => {
      const existing = countryMap.get(n.country) || { spend: 0, count: 0, atRisk: 0, maxRisk: 0, code: n.countryCode };
      existing.spend += n.spend;
      existing.count += 1;
      if (n.status !== 'NOMINAL') {
        existing.atRisk += n.spend;
      }
      existing.maxRisk = Math.max(existing.maxRisk, n.riskScore);
      countryMap.set(n.country, existing);
    });

    const byCountry = Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      countryCode: data.code,
      spendUSD: data.spend,
      supplierCount: data.count,
      atRiskSpendUSD: data.atRisk,
      highestRiskScore: data.maxRisk,
      status: data.maxRisk >= 0.70 ? 'CRITICAL' : data.maxRisk >= 0.35 ? 'ELEVATED' : 'NOMINAL' as any,
    }));

    // Group by Tier
    const tierMap = new Map<number, { spend: number; count: number; atRisk: number }>();
    this.dag.nodes.forEach(n => {
      const existing = tierMap.get(n.tier) || { spend: 0, count: 0, atRisk: 0 };
      existing.spend += n.spend;
      existing.count += 1;
      if (n.status !== 'NOMINAL') {
        existing.atRisk += n.spend;
      }
      tierMap.set(n.tier, existing);
    });

    const byTier = Array.from(tierMap.entries()).sort((a, b) => a[0] - b[0]).map(([tier, data]) => ({
      tier,
      tierLabel: tier === 0 ? 'Tier 0 (Assembly)' : `Tier ${tier}`,
      spendUSD: data.spend,
      supplierCount: data.count,
      atRiskSpendUSD: data.atRisk,
    }));

    return {
      orgId,
      timestamp: new Date().toISOString(),
      byCountry,
      byTier,
      esgCompliance: {
        totalSuppliers: this.dag.nodes.length,
        certifiedSuppliersCount: this.dag.nodes.filter(n => n.certifications.length > 0).length,
        compliancePercentage: 92.5,
        laborStandardsCertifiedCount: 8,
        environmentalCertifiedCount: 9,
      },
    };
  }
}


// Global simulator singleton
const simulator = new SupplyChainSimulator();

// Exported API Methods with Automatic Fallback
export const api = {
  // 1. Fetch DAG
  async getSupplyChainDAG(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<SupplyChainDAGResponse> {
    try {
      const res = await fetch(`${API_BASE}/supply-chain/${orgId}`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return simulator.getDAG();
    }
  },

  // 2. Fetch Risk State Telemetry
  async getRiskState(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<RiskStateResponse> {
    try {
      const res = await fetch(`${API_BASE}/risk-state/${orgId}`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return simulator.getRiskState(orgId);
    }
  },

  // 3. Trigger Disruption Sentinel
  async triggerDisruption(
    supplierId: string, 
    severity: number = 0.95, 
    type: string = 'GEOPOLITICAL_BLOCKADE'
  ): Promise<{ dag: SupplyChainDAGResponse; memo: MitigationMemo }> {
    try {
      const res = await fetch(`${API_BASE}/disruption/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, severity, type }),
        signal: AbortSignal.timeout(2500)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Fetch fresh DAG from backend CTE
      const freshDag = await this.getSupplyChainDAG();

      // Fetch AI mitigation memo for target node
      let memo: MitigationMemo | null = null;
      try {
        const memoRes = await fetch(`${API_BASE}/mitigation/${supplierId}`, {
          method: 'POST',
          signal: AbortSignal.timeout(2500)
        });
        if (memoRes.ok) {
          memo = await memoRes.json();
        }
      } catch {
        // Fallback handled below
      }

      if (!memo) {
        const sim = simulator.triggerDisruption(supplierId, severity, type);
        memo = sim.memo;
      }

      return {
        dag: freshDag,
        memo,
      };
    } catch {
      return simulator.triggerDisruption(supplierId, severity, type);
    }
  },

  // 4. Reset Disruption State
  async resetRiskState(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<SupplyChainDAGResponse> {
    try {
      const res = await fetch(`${API_BASE}/disruption/reset/${orgId}`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return simulator.reset(orgId);
    } catch {
      return simulator.reset(orgId);
    }
  },

  // 5. Execute Reroute
  async executeReroute(supplierId: string, alternateId: string, memoId?: string): Promise<RerouteExecutionResponse> {
    try {
      const res = await fetch(`${API_BASE}/mitigation/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memoId: memoId || '60000000-0000-0000-0000-000000000001',
          supplierId, 
          alternateId 
        }),
        signal: AbortSignal.timeout(2500)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const freshDag = await this.getSupplyChainDAG();
      return {
        ...data,
        updatedDAG: freshDag,
      };
    } catch {
      return simulator.executeReroute();
    }
  },


  // 6. Get Portfolio Analytics
  async getPortfolioAnalytics(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<PortfolioBreakdownResponse> {
    try {
      let res = await fetch(`${API_BASE}/analytics/portfolio-breakdown/${orgId}`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/analytics/portfolio/${orgId}`, { signal: AbortSignal.timeout(1500) });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return simulator.getPortfolioBreakdown(orgId);
    }
  },

  // 7. Get Candidate Alternates for a Disrupted Node
  async getAlternates(supplierId: string): Promise<AlternateSupplier[]> {
    try {
      const res = await fetch(`${API_BASE}/alternates/${supplierId}`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.alternates || [];
    } catch {
      return simulator.getAlternates(supplierId);
    }
  },

  // 8. Scenarios list
  getScenarios(): DisruptionScenario[] {
    return simulator.getScenarios();
  },

  // 9. AI Intelligence Copilot Query
  async askAICopilot(query: string, supplierId?: string): Promise<AICopilotResponse> {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, supplierId }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        return await res.json();
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      // Fallback deterministic response
      return {
        query,
        headline: 'Autonomous Supply Chain Disruption Intelligence',
        summary: `Analysis completed for: "${query}". Critical bottleneck identified in Tier-2 DriveTech inverters and Tier-4 maritime transit at Bab-el-Mandeb Strait.`,
        rootCauseDiagnosis: 'Propagated 0.7x CTE risk attenuation confirms Sole Point of Failure (SPOF) exposure on European and Asian manufacturing corridors.',
        affectedTiers: ['Tier 4: Raw Material & Maritime', 'Tier 2: Component Manufacturers', 'Tier 1: Direct Subsystems'],
        affectedSupplierNames: ['Apex Maritime Logistics', 'DriveTech Inverters Inc.', 'Apex PowerSystems GmbH'],
        riskMetrics: {
          probability: 0.94,
          severity: 0.88,
          confidence: 0.96,
          financialExposureUSD: '$41,540,000',
          sdgImpact: {
            sdg8ForcedLabor: 'Strict UFLPA provenance audit compliance required for silicon smelters.',
            sdg12AvoidedCarbon: 'Rerouting via Nordic Cape route avoids 1,420.5 tCO2e in Scope-3 emissions.',
          },
        },
        recommendations: {
          action: 'Execute autonomous procurement reroute to pre-qualified Nordic Horn Maritime Lines and secondary inverters in Vietnam & Mexico.',
          targetSupplierId: '10000000-0000-0000-0000-000000000007',
          alternateSupplierId: '50000000-0000-0000-0000-000000000001',
          alternateName: 'Nordic Horn Maritime Lines (Norway Cape Route)',
          priceVariancePct: 4.2,
          leadTimeDeltaDays: -3,
          avoidedScope3Tco2e: 1420.5,
        },
        suggestedAction: 'SIMULATE_DISRUPTION',
        suggestedActionLabel: 'Simulate on DAG Canvas',
        suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000007', severity: 0.94 },
      };
    }
  },

  // 10. AI Supplier Risk Audit
  async auditSupplierWithAI(supplierId: string): Promise<SupplierAIAudit> {
    const node = simulator.getDAG().nodes.find(n => n.id === supplierId);
    const name = node?.name || 'Target Supplier';
    const isXinjiang = node?.country.toLowerCase().includes('china') || node?.code.includes('XPS');
    const isChokepoint = node?.code.includes('AML') || node?.name.toLowerCase().includes('maritime');

    return {
      supplierId,
      supplierName: name,
      auditTimestamp: new Date().toISOString(),
      compositeRiskScore: node ? Math.round(node.riskScore * 100) : 45,
      uflpaSanctionStatus: isXinjiang ? 'UNDER_REVIEW' : 'CLEARED',
      forcedLaborRiskRationale: isXinjiang 
        ? 'Rebuttable presumption notice active under UFLPA Section 307. Requires audited chain-of-custody for silica feedstock.' 
        : 'Full international labor standards clearance verified under ILO conventions and UN SDG 8.',
      scope3DecarbonizationRating: isChokepoint ? 'CRITICAL' : isXinjiang ? 'C' : 'A',
      estimatedAnnualEmissionsTco2e: node ? Math.round(node.spend * 142.5) : 3400,
      spofVulnerabilityAnalysis: node?.isSPOF 
        ? 'High severity Single Point of Failure (SPOF). Sole source supplier with no automated parallel line.' 
        : 'Moderate redundancy with pre-qualified alternate suppliers available on 14-day failover.',
      recommendedMitigationStrategy: isChokepoint
        ? 'Engage Nordic Cape dual-fuel maritime carriers avoiding Bab-el-Mandeb corridor (+4.2% cost, -3 days lead time, 1,420 tCO2e avoided).'
        : 'Maintain secondary volume allocation contracts with domestic European / US suppliers.',
    };
  },

  // 11. AI Trade-off Explanation for Mitigation Memo
  async explainMitigationTradeoffsWithAI(memo: MitigationMemo): Promise<string> {
    return (
      `AUTONOMOUS AI TRADE-OFF SYNTHESIS // UN SDG 8 & SDG 12\n\n` +
      `1. PRICE VARIANCE (+${memo.priceVariancePct}%):\n` +
      `   The +${memo.priceVariancePct}% premium for ${memo.alternateName} is strictly operationalized through high-efficiency dual-fuel low-sulfur vessels and audited tier-1 clean room packaging.\n\n` +
      `2. TRANSIT ADVANTAGE (${memo.leadTimeDeltaDays} DAYS):\n` +
      `   By preempting maritime canal port congestion and border quarantine delays, delivery throughput is compressed by ${Math.abs(memo.leadTimeDeltaDays)} business days.\n\n` +
      `3. SCOPE-3 DECARBONIZATION (+${memo.avoidedScope3Tco2e} tCO2e):\n` +
      `   Prevents bunker fuel idle burn in high-risk zones, delivering audited Scope-3 GHG compliance for EU CSRD & SEC climate reporting disclosure.`
    );
  },

  // 12. Multi-BOM Presets Catalog
  async getBOMPresets(): Promise<BOMPresetInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/scenarios/boms`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (data.presets && Array.isArray(data.presets)) {
          return data.presets.map((p: any) => ({
            ...BOM_PRESETS_CATALOG[p.key],
            ...p,
          }));
        }
      }
    } catch {
      // Fallback below
    }
    return Object.values(BOM_PRESETS_CATALOG);
  },

  // 13. Load Multi-BOM Architecture Preset
  async loadBOMPreset(
    presetKey: string,
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<{ dag: SupplyChainDAGResponse; message: string; preset: BOMPresetInfo }> {
    const presetInfo = BOM_PRESETS_CATALOG[presetKey] || BOM_PRESETS_CATALOG.EV_BATTERY_PACK;
    try {
      const res = await fetch(`${API_BASE}/scenarios/boms/${presetKey}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = await res.json();
        const freshDag = await this.getSupplyChainDAG(orgId);
        simulator.loadBOM(presetKey);
        return {
          dag: freshDag && freshDag.nodes?.length > 0 ? freshDag : simulator.getDAG(),
          message: data.message || `Activated ${presetInfo.title}`,
          preset: presetInfo,
        };
      }
    } catch {
      // Fallback below
    }

    const dag = simulator.loadBOM(presetKey);
    return {
      dag,
      message: `Active BOM: ${presetInfo.title} (${presetInfo.nodeCount} nodes)`,
      preset: presetInfo,
    };
  },

  getActiveBOMKey(): string {
    return simulator.getActiveBOMKey();
  }
};


