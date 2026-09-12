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
import { INITIAL_DAG_DATA, ALTERNATES_MAP, SCENARIO_PRESETS } from '../data/seed-graph';

const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

// In-memory simulation state for instant zero-dependency client execution
class SupplyChainSimulator {
  private dag: SupplyChainDAGResponse;
  private activeDisruptions: { supplierId: string; type: string; severity: number }[] = [];
  private avoidedScope3: number = 0;
  private currentMemo: MitigationMemo | null = null;

  constructor() {
    this.dag = JSON.parse(JSON.stringify(INITIAL_DAG_DATA));
  }

  public getDAG(): SupplyChainDAGResponse {
    return JSON.parse(JSON.stringify(this.dag));
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
      const data = await res.json();
      return {
        dag: data.updatedDAG || simulator.getDAG(),
        memo: data.mitigationMemo,
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
  async executeReroute(supplierId: string, alternateId: string): Promise<RerouteExecutionResponse> {
    try {
      const res = await fetch(`${API_BASE}/mitigation/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, alternateId }),
        signal: AbortSignal.timeout(2500)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
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
  }
};
