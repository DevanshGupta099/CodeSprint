'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WebGLGridCanvas } from '../components/canvas/WebGLGridCanvas';
import { TopBar } from '../components/telemetry/TopBar';
import { FlowCanvas } from '../components/graph/FlowCanvas';
import { DisruptionControlDeck } from '../components/controls/DisruptionControlDeck';
import { ProcurementSwitchMemo } from '../components/terminal/ProcurementSwitchMemo';
import { SupplierDetailDrawer } from '../components/graph/SupplierDetailDrawer';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { BOMUploadModal } from '../components/ingestion/BOMUploadModal';
import { api } from '../services/api';
import { 
  SupplyChainDAGResponse, 
  RiskStateResponse, 
  MitigationMemo, 
  Supplier, 
  DisruptionScenario,
  PortfolioBreakdownResponse,
  AlternateSupplier
} from '../types/supply-chain';

export default function CommandCenterPage() {
  const [dag, setDag] = useState<SupplyChainDAGResponse | null>(null);
  const [riskState, setRiskState] = useState<RiskStateResponse | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierAlternates, setSelectedSupplierAlternates] = useState<AlternateSupplier[]>([]);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [scenarios, setScenarios] = useState<DisruptionScenario[]>([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('red-sea');
  const [activeTierFilter, setActiveTierFilter] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecutingReroute, setIsExecutingReroute] = useState(false);
  
  // Modals & Panels
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioBreakdownResponse | null>(null);

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [initialDag, initialRisk, scenarioList] = await Promise.all([
          api.getSupplyChainDAG(),
          api.getRiskState(),
          api.getScenarios(),
        ]);
        if (isMounted) {
          setDag(initialDag);
          setRiskState(initialRisk);
          setScenarios(scenarioList);
        }
      } catch (err) {
        console.error('Failed to initialize supply chain data:', err);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Poll risk telemetry every 3 seconds to reflect live CTE state
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedRisk = await api.getRiskState();
        setRiskState(updatedRisk);
      } catch (err) {
        // Fallback gracefully without throwing
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // When selected supplier changes, fetch its alternates
  useEffect(() => {
    if (!selectedSupplier) {
      setSelectedSupplierAlternates([]);
      return;
    }
    const alternates = (api as any).getAlternates
      ? (api as any).getAlternates(selectedSupplier.id)
      : [];
    setSelectedSupplierAlternates(alternates);
  }, [selectedSupplier]);

  // Filter DAG nodes based on active Tier filter (T0 - T4)
  const filteredDAG = useMemo<SupplyChainDAGResponse | null>(() => {
    if (!dag) return null;
    if (activeTierFilter === null) return dag;

    const filteredNodes = dag.nodes.filter((n) => n.tier === activeTierFilter);
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = dag.edges.filter(
      (e) => filteredNodeIds.has(e.childSupplierId) && filteredNodeIds.has(e.parentSupplierId)
    );

    return {
      organization: dag.organization,
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [dag, activeTierFilter]);

  // Is any critical node active?
  const isDisrupted = useMemo(() => {
    return dag?.nodes.some((n) => n.status === 'CRITICAL') || false;
  }, [dag]);

  // Active scenario details
  const currentScenario = useMemo(() => {
    return scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];
  }, [scenarios, selectedScenarioKey]);

  // 1. Simulate Disruption Action (Disruption Sentinel)
  const handleSimulateDisruption = useCallback(
    async (scenarioKey: string) => {
      if (!dag) return;
      setIsProcessing(true);

      const scenario = scenarios.find((s) => s.key === scenarioKey) || scenarios[0];
      const targetNode =
        dag.nodes.find((n) => n.code === scenario?.targetSupplierCode) ||
        dag.nodes.find((n) => n.materialCategory.includes('Shipping') || n.name.includes('Apex Maritime')) ||
        dag.nodes[0];

      try {
        const result = await api.triggerDisruption(
          targetNode.id,
          scenario?.severity || 0.95,
          scenario?.disruptionType || 'GEOPOLITICAL_BLOCKADE'
        );
        setDag(result.dag);
        setActiveMemo(result.memo);
        const updatedRisk = await api.getRiskState();
        setRiskState(updatedRisk);
      } catch (err) {
        console.error('Disruption simulation error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [dag, scenarios]
  );

  // 2. Reset Disruption State Action
  const handleReset = useCallback(async () => {
    setIsProcessing(true);
    try {
      const nominalDag = await api.resetRiskState();
      setDag(nominalDag);
      setActiveMemo(null);
      setSelectedSupplier(null);
      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 3. Execute Autonomous Reroute Action
  const handleExecuteReroute = useCallback(async () => {
    if (!activeMemo) return;
    setIsExecutingReroute(true);

    try {
      const response = await api.executeReroute(
        activeMemo.disruptedSupplierId,
        activeMemo.alternateSupplierId
      );

      if (response.updatedDAG) {
        setDag(response.updatedDAG);
      } else {
        // Fallback DAG update
        const freshDag = await api.getSupplyChainDAG();
        setDag(freshDag);
      }

      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
      setActiveMemo(null);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Execute reroute error:', err);
    } finally {
      setIsExecutingReroute(false);
    }
  }, [activeMemo]);

  // 4. Open Analytics Drawer
  const handleOpenAnalytics = useCallback(async () => {
    try {
      const data = await api.getPortfolioAnalytics();
      setPortfolioData(data);
      setIsAnalyticsOpen(true);
    } catch (err) {
      console.error('Analytics load error:', err);
    }
  }, []);

  // 5. Handle BOM Upload Success
  const handleUploadSuccess = useCallback(async () => {
    try {
      const freshDag = await api.getSupplyChainDAG();
      setDag(freshDag);
      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
    } catch (err) {
      console.error('Post-upload refresh error:', err);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#07090E] select-none font-mono">
      {/* Background Atmosphere & Ambient WebGL Canvas */}
      <div className="hud-bg-ambient" />
      <WebGLGridCanvas
        isDisrupted={isDisrupted}
        disruptionLabel={currentScenario?.title}
      />

      {/* Top Bar Telemetry HUD */}
      <TopBar
        riskState={riskState}
        onReset={handleReset}
        onOpenAnalytics={handleOpenAnalytics}
        onOpenIngest={() => setIsIngestOpen(true)}
        isProcessing={isProcessing}
        activeTierFilter={activeTierFilter}
        onSelectTierFilter={setActiveTierFilter}
      />

      {/* Main Interactive React Flow Command Canvas */}
      <main className="relative flex-1 w-full h-full overflow-hidden z-10 pt-14 pb-20">
        {filteredDAG ? (
          <FlowCanvas
            dag={filteredDAG}
            onSelectSupplier={setSelectedSupplier}
            selectedSupplierId={selectedSupplier?.id}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-cyan-400 text-xs">
            <span className="animate-pulse tracking-widest uppercase font-bold">
              [CONSTRUCTING RECURSIVE POSTGRESQL CTE GRAPH...]
            </span>
          </div>
        )}
      </main>

      {/* Disruption Control Deck (Bottom Center Anchor) */}
      <DisruptionControlDeck
        scenarios={scenarios}
        selectedScenarioKey={selectedScenarioKey}
        onSelectScenario={setSelectedScenarioKey}
        onSimulate={handleSimulateDisruption}
        isProcessing={isProcessing}
        isDisrupted={isDisrupted}
        onReset={handleReset}
      />

      {/* Terminal Typewriter Procurement Switch Memo */}
      <ProcurementSwitchMemo
        memo={activeMemo}
        onExecuteReroute={handleExecuteReroute}
        isExecuting={isExecutingReroute}
        onClose={() => setActiveMemo(null)}
      />

      {/* Node Detail Inspector Drawer */}
      <SupplierDetailDrawer
        supplier={selectedSupplier}
        alternates={selectedSupplierAlternates}
        onClose={() => setSelectedSupplier(null)}
        onSimulateDisruptionOnNode={(id) => {
          if (!dag) return;
          api.triggerDisruption(id, 0.95, 'GEOPOLITICAL_BLOCKADE').then((res) => {
            setDag(res.dag);
            setActiveMemo(res.memo);
          });
        }}
      />

      {/* Executive Portfolio Analytics Modal */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        data={portfolioData}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* BOM Ingestion Modal */}
      <BOMUploadModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
