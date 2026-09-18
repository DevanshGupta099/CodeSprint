'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GlobalHeader, ZentraTab } from '@/components/zentra/GlobalHeader';
import { SubHeaderToolbar } from '@/components/zentra/SubHeaderToolbar';
import { MaterialFlowFunnelCard } from '@/components/zentra/MaterialFlowFunnelCard';
import { ValueAtRiskCard } from '@/components/zentra/ValueAtRiskCard';
import { SteppedVolatilityCard } from '@/components/zentra/SteppedVolatilityCard';
import { DualEqualizerHistogramCard } from '@/components/zentra/DualEqualizerHistogramCard';
import { HeroSunsetMeshCard } from '@/components/zentra/HeroSunsetMeshCard';
import { SVGDefs } from '@/components/zentra/SVGDefs';
import { INITIAL_DAG_DATA } from '@/data/seed-graph';
import { SupplyChainDAGResponse, Supplier, MitigationMemo, PortfolioBreakdownResponse } from '@/types/supply-chain';
import { AICopilotResponse } from '@/types/ai';
import { api } from '@/services/api';
import { useRiskState } from '@/hooks/useRiskState';
import { BOM_PRESETS_CATALOG, buildContextualMitigationMemo } from '@/data/bom-presets';

// Performance: Code-split heavy interactive workspaces & modals into on-demand chunks
const SupplyWorkflowStudio = dynamic(
  () => import('@/components/graph/SupplyWorkflowStudio').then((m) => m.SupplyWorkflowStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] rounded-3xl bg-neutral-100/50 dark:bg-slate-900/50 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-3 font-mono text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-semibold text-neutral-700 dark:text-slate-300">INITIALIZING DAG WORKFLOW STUDIO...</span>
        </div>
        <span className="text-[10px] text-neutral-400 dark:text-slate-500">Tier-N Relational Network Engine (Dagre CTE)</span>
      </div>
    ),
  }
);

const ReportsView = dynamic(
  () => import('@/components/dashboard/ReportsView').then((m) => m.ReportsView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl bg-neutral-100/50 dark:bg-slate-900/50 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center gap-3 font-mono text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="font-semibold text-neutral-700 dark:text-slate-300">COMPILING EXECUTIVE RISK ANALYTICS...</span>
        </div>
      </div>
    ),
  }
);

const AnalyticsDashboard = dynamic(
  () => import('@/components/dashboard/AnalyticsDashboard').then((m) => m.AnalyticsDashboard),
  { ssr: false }
);

const BOMIngestionModal = dynamic(
  () => import('@/components/ingestion/BOMIngestionModal').then((m) => m.BOMIngestionModal),
  { ssr: false }
);

const AICopilotModal = dynamic(
  () => import('@/components/ai/AICopilotModal').then((m) => m.AICopilotModal),
  { ssr: false }
);

const ZentraDetailModal = dynamic(
  () => import('@/components/zentra/ZentraDetailModal').then((m) => m.ZentraDetailModal),
  { ssr: false }
);

const SupplierDetailDrawer = dynamic(
  () => import('@/components/graph/SupplierDetailDrawer').then((m) => m.SupplierDetailDrawer),
  { ssr: false }
);

const ProcurementSwitchMemo = dynamic(
  () => import('@/components/terminal/ProcurementSwitchMemo').then((m) => m.ProcurementSwitchMemo),
  { ssr: false }
);

export default function VeritasSupplyDashboard() {
  const [activeTab, setActiveTab] = useState<ZentraTab>('overview');
  const [isDisrupted, setIsDisrupted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dagData, setDagData] = useState<SupplyChainDAGResponse>(INITIAL_DAG_DATA);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [avoidedCo2Total, setAvoidedCo2Total] = useState<number>(0);
  const [activeBOMKey, setActiveBOMKey] = useState<string>('EV_BATTERY_PACK');
  const [spendAtRiskUSD, setSpendAtRiskUSD] = useState<number>(12000000);
  const [portfolioData, setPortfolioData] = useState<PortfolioBreakdownResponse | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // AI Copilot state
  const [copilotResponse, setCopilotResponse] = useState<AICopilotResponse | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);

  // Bento widget visibility customization
  const [visibleWidgets, setVisibleWidgets] = useState({
    funnel: true,
    var: true,
    volatility: true,
    equalizer: true,
    insight: true,
  });

  // Segmented date range and granularity state (controlled by SubHeaderToolbar)
  const [range1, setRange1] = useState<string>('Jan 01 - July 31');
  const [range2, setRange2] = useState<string>('Aug 01 - Dec 31');
  const [granularity, setGranularity] = useState<string>('Daily');

  const handleResetFilters = useCallback(() => {
    setRange1('Jan 01 - July 31');
    setRange2('Aug 01 - Dec 31');
    setGranularity('Daily');
  }, []);

  const handleSetAllWidgets = useCallback((visible: boolean) => {
    setVisibleWidgets({
      funnel: visible,
      var: visible,
      volatility: visible,
      equalizer: visible,
      insight: visible,
    });
  }, []);

  // Automated background polling hook (Task 1: 3-5s setInterval against /api/risk-state/:orgId)
  useRiskState({
    orgId: '00000000-0000-0000-0000-000000000001',
    intervalMs: 4000,
    enabled: true,
    onRiskStateChange: (polledState) => {
      // 1. Update financial value at risk
      if (polledState.portfolioMetrics?.totalSpendAtRiskUSD) {
        setSpendAtRiskUSD(polledState.portfolioMetrics.totalSpendAtRiskUSD);
      }
      if (polledState.portfolioMetrics?.avoidedScope3Tco2e > 0) {
        setAvoidedCo2Total(polledState.portfolioMetrics.avoidedScope3Tco2e);
      }

      // 2. Synchronize node risk scores and statuses in active DAG
      setDagData((prevDag) => {
        let hasChanges = false;
        const stateMap = new Map(polledState.nodes.map((n) => [n.supplierId, n]));
        const updatedNodes = prevDag.nodes.map((node) => {
          const matched = stateMap.get(node.id);
          if (
            matched &&
            (matched.status !== node.status ||
              matched.riskScore !== node.riskScore ||
              matched.isSPOF !== node.isSPOF)
          ) {
            hasChanges = true;
            return {
              ...node,
              status: matched.status,
              riskScore: matched.riskScore,
              isSPOF: matched.isSPOF,
            };
          }
          return node;
        });

        return hasChanges ? { ...prevDag, nodes: updatedNodes } : prevDag;
      });

      // 3. Update global disruption state
      const hasDisruption =
        polledState.portfolioMetrics.activeDisruptionsCount > 0 ||
        polledState.nodes.some((n) => n.status === 'CRITICAL');
      setIsDisrupted(hasDisruption);
    },
  });

  // Fetch initial DAG from backend API (or fallback to simulator)
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ZentraTab | null;
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
    api.getSupplyChainDAG().then((data) => {
      if (isMounted && data && data.nodes) {
        setDagData(data);
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // Fetch portfolio breakdown for Recharts Analytics Dashboard on demand
  useEffect(() => {
    if (activeTab === 'reports' || isAnalyticsOpen) {
      api.getPortfolioAnalytics().then(setPortfolioData).catch(console.error);
    }
  }, [activeTab, isAnalyticsOpen]);


  // Switch Active BOM Architecture Preset
  const handleSelectBOM = useCallback(async (presetKey: string) => {
    setIsProcessing(true);
    setActiveBOMKey(presetKey);
    try {
      const res = await api.loadBOMPreset(presetKey);
      if (res && res.dag && res.dag.nodes) {
        setDagData(res.dag);
      }
      setIsDisrupted(false);
      setActiveMemo(null);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('BOM preset switch error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 1. Trigger Disruption Sentinel for specific or default node
  const handleTriggerDisruption = useCallback(async (targetSupplierId?: string, customSeverity?: number) => {
    setIsProcessing(true);
    try {
      // Default to active BOM chokepoint node if no ID supplied
      const defaultSupplierId = BOM_PRESETS_CATALOG[activeBOMKey]?.primaryChokepointSupplierId || '30000000-0000-0000-0000-000000000001';
      const supplierId = targetSupplierId || defaultSupplierId;
      const severity = customSeverity || 0.94;
      const res = await api.triggerDisruption(supplierId, severity, 'GEOPOLITICAL_BLOCKADE');
      
      setIsDisrupted(true);
      if (res && res.dag) {
        setDagData(res.dag);
      }

      const memo: MitigationMemo = res?.memo || buildContextualMitigationMemo(supplierId, dagData, activeBOMKey);
      setActiveMemo(memo);
    } catch (err) {
      console.error('Trigger disruption error:', err);
      setIsDisrupted(true);
      const defaultSupplierId = BOM_PRESETS_CATALOG[activeBOMKey]?.primaryChokepointSupplierId || '30000000-0000-0000-0000-000000000001';
      const supplierId = targetSupplierId || defaultSupplierId;
      setActiveMemo(buildContextualMitigationMemo(supplierId, dagData, activeBOMKey));
    } finally {
      setIsProcessing(false);
    }
  }, [activeBOMKey, dagData]);

  // 2. Execute Reroute Action
  const handleExecuteReroute = useCallback(async () => {
    if (!activeMemo) return;
    setIsProcessing(true);

    try {
      const res = await api.executeReroute(
        activeMemo.disruptedSupplierId,
        activeMemo.alternateSupplierId,
        activeMemo.id
      );

      if (res && res.updatedDAG) {
        setDagData(res.updatedDAG);
      }

      setIsDisrupted(false);
      setAvoidedCo2Total((prev) => prev + activeMemo.avoidedScope3Tco2e);
      setActiveMemo(null);
    } catch (err) {
      console.error('Execute reroute error:', err);
      setIsDisrupted(false);
      setActiveMemo(null);
    } finally {
      setIsProcessing(false);
    }
  }, [activeMemo]);

  // 3. Reset Baseline State
  const handleResetBaseline = useCallback(async () => {
    setIsProcessing(true);
    try {
      const resetDag = await api.resetRiskState();
      if (resetDag && resetDag.nodes) {
        setDagData(resetDag);
      }
      setIsDisrupted(false);
      setActiveMemo(null);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Reset error:', err);
      setIsDisrupted(false);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 4. AI Copilot Query Execution
  const handleExplorePrompt = useCallback(async (promptText: string) => {
    setIsProcessingAi(true);
    try {
      const res = await api.askAICopilot(promptText);
      setCopilotResponse(res);
      setIsCopilotOpen(true);
    } catch (err) {
      console.error('AI Copilot query error:', err);
    } finally {
      setIsProcessingAi(false);
    }
  }, []);

  // 5. Execute Action directly from AI Copilot Modal
  const handleExecuteCopilotAction = useCallback(async (response: AICopilotResponse) => {
    if (response.suggestedAction === 'SIMULATE_DISRUPTION') {
      const targetId = response.suggestedPayload?.supplierId || response.recommendations.targetSupplierId;
      const severity = response.suggestedPayload?.severity || 0.94;
      await handleTriggerDisruption(targetId, severity);
      setIsCopilotOpen(false);
      setActiveTab('graph');
    } else if (response.suggestedAction === 'EXECUTE_REROUTE') {
      if (activeMemo) {
        await handleExecuteReroute();
      } else {
        await handleTriggerDisruption(response.recommendations.targetSupplierId);
      }
      setIsCopilotOpen(false);
      setActiveTab('graph');
    } else if (response.suggestedAction === 'INSPECT_SUPPLIER') {
      const targetId = response.suggestedPayload?.supplierId || response.recommendations.targetSupplierId;
      const node = dagData.nodes.find(n => n.id === targetId);
      if (node) setSelectedSupplier(node);
      setIsCopilotOpen(false);
      setActiveTab('graph');
    } else {
      setIsCopilotOpen(false);
      setActiveTab('graph');
    }
  }, [handleTriggerDisruption, handleExecuteReroute, activeMemo, dagData]);

  return (
    <div className="min-h-screen w-full tactile-canvas text-neutral-900 dark:text-slate-100 font-sans antialiased pb-20 flex flex-col overflow-x-hidden">
      {/* GLOBAL SVG PATTERNS: 45-degree Candy Stripes & 3D Gradients */}
      <SVGDefs />

      {/* Breadcrumb back to Editorial Landing Page */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-3 pb-1 flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-slate-400 overflow-hidden">
        <Link 
          href="/" 
          aria-label="Return to landing overview"
          className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>←</span> <span className="font-semibold">LANDING OVERVIEW</span>
        </Link>
        <span className="tracking-widest uppercase text-[10px] text-neutral-500 dark:text-slate-400 hidden sm:inline truncate">TACTICAL ENGINE // ORG_ID: 00000000-0000-0000-0000-000000000001</span>
        <span className="tracking-widest uppercase text-[9px] text-neutral-500 dark:text-slate-400 sm:hidden">ORG: ...0001</span>
      </div>

      {/* 1. HEADER & NAVIGATION: Responsive Floating Rounded Pill Nav Bar */}
      <GlobalHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setActiveTab('suppliers')}
        onSimulateRedSea={isDisrupted ? handleResetBaseline : () => handleTriggerDisruption()}
        onSelectSupplierFromSearch={(supplier) => {
          setSelectedSupplier(supplier);
          setActiveTab('graph');
        }}
        isDisrupted={isDisrupted}
        isProcessing={isProcessing}
        activeBOMKey={activeBOMKey}
        onSelectBOM={handleSelectBOM}
        onOpenIngest={() => setIsIngestModalOpen(true)}
      />

      {/* 2. SUB-HEADER ACTION BAR: Responsive "Overview" & Segmented Date/Widget Selectors */}
      <SubHeaderToolbar
        title={
          activeTab === 'overview'
            ? 'Overview'
            : activeTab === 'graph'
            ? 'Supply Dependency DAG'
            : activeTab === 'reports'
            ? 'Executive Reports & Risk Analytics'
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }
        visibleWidgets={visibleWidgets}
        onToggleWidget={(key) => setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key] }))}
        onSetAllWidgets={handleSetAllWidgets}
        range1={range1}
        onRange1Change={setRange1}
        range2={range2}
        onRange2Change={setRange2}
        granularity={granularity}
        onGranularityChange={setGranularity}
        onResetFilters={handleResetFilters}
        onAddWidget={() => setActiveTab('graph')}
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 flex-1 flex flex-col gap-6">
        {/* VIEW A: OVERVIEW TAB (ZENTRA BENTO GRID) - Renders during overview or active inspection modal */}
        {(activeTab === 'overview' || activeTab === 'suppliers' || activeTab === 'disruptions' || activeTab === 'sanctions' || activeTab === 'esg') && (
          <>
            {/* ROW 1: TOP HERO (65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* TOP LEFT (65% -> 8 cols): 3D Isometric Material Flow Funnel with AI Copilot Dock */}
              {visibleWidgets.funnel && (
                <div className={`${visibleWidgets.var ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col`}>
                  <MaterialFlowFunnelCard
                    onExplorePrompt={handleExplorePrompt}
                    onSelectStage={(stageId) => {
                      setActiveTab('graph');
                    }}
                    isProcessingPrompt={isProcessingAi}
                    range1={range1}
                    range2={range2}
                    granularity={granularity}
                  />
                </div>
              )}

              {/* TOP RIGHT (35% -> 4 cols): Value at Risk ($41,540,000 & 3 Striped Progress Bars) */}
              {visibleWidgets.var && (
                <div className={`${visibleWidgets.funnel ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col`}>
                  <ValueAtRiskCard
                    totalSpendAtRiskUSD={spendAtRiskUSD}
                    isDisrupted={isDisrupted}
                    range1={range1}
                    range2={range2}
                    granularity={granularity}
                  />
                </div>
              )}
            </div>

            {/* ROW 2: BOTTOM 3-COLUMN BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {/* Bottom Left: Stepped Volatility Area Chart */}
              {visibleWidgets.volatility && (
                <SteppedVolatilityCard 
                  range1={range1}
                  granularity={granularity}
                />
              )}

              {/* Bottom Center: Dual Equalizer Histogram Card */}
              {visibleWidgets.equalizer && (
                <DualEqualizerHistogramCard 
                  granularity={granularity}
                  range1={range1}
                  range2={range2}
                />
              )}

              {/* Bottom Right: Hero Sunset Gradient AI Insight Card */}
              {visibleWidgets.insight && (
                <HeroSunsetMeshCard
                  onExploreMitigation={() => handleTriggerDisruption()}
                />
              )}
            </div>
          </>
        )}

        {/* VIEW B: SUPPLY GRAPH TAB (SUPPLY WORKFLOW STUDIO) */}
        {activeTab === 'graph' && (
          <SupplyWorkflowStudio
            dag={dagData}
            onTriggerDisruption={(targetId) => handleTriggerDisruption(targetId)}
            onResetBaseline={handleResetBaseline}
            isDisrupted={isDisrupted}
            isProcessing={isProcessing}
            selectedSupplier={selectedSupplier}
            onSelectSupplier={setSelectedSupplier}
            avoidedCo2Total={avoidedCo2Total}
          />
        )}

        {/* VIEW C: EXECUTIVE REPORTS & RISK ANALYTICS TAB */}
        {activeTab === 'reports' && (
          <ReportsView
            data={portfolioData}
            isDisrupted={isDisrupted}
            avoidedCo2Total={avoidedCo2Total}
            spendAtRiskUSD={spendAtRiskUSD}
            onSimulateDisruption={() => handleTriggerDisruption()}
            onResetBaseline={handleResetBaseline}
          />
        )}
      </main>

      {/* TAB DETAIL MODAL (SUPPLIERS, DISRUPTIONS, SANCTIONS, ESG) */}
      <ZentraDetailModal
        activeTab={activeTab === 'reports' ? 'overview' : activeTab}
        onClose={() => setActiveTab('overview')}
        onTriggerDisruption={(id) => {
          handleTriggerDisruption(id);
          setActiveTab('graph');
        }}
        onSelectSupplier={(supplier) => {
          setSelectedSupplier(supplier);
          setActiveTab('graph');
        }}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* RECHARTS EXECUTIVE RISK & PROGRESSION ANALYTICS MODAL (STANDALONE) */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        data={portfolioData}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* SUPPLIER DETAIL INSPECTION DRAWER (WHEN NODE CLICKED ON OVERVIEW) */}
      {activeTab !== 'graph' && (
        <SupplierDetailDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onSimulateDisruptionOnNode={(id: string) => {
            handleTriggerDisruption(id);
            setActiveTab('graph');
          }}
        />
      )}

      {/* THE TERMINAL TYPEWRITER PROCUREMENT SWITCH MEMO ([EXECUTE_REROUTE]) */}
      <ProcurementSwitchMemo
        memo={activeMemo}
        onExecuteReroute={handleExecuteReroute}
        isExecuting={isProcessing}
        onClose={() => setActiveMemo(null)}
      />

      {/* VERITAS AI COPILOT REASONING MODAL */}
      <AICopilotModal
        response={copilotResponse}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onExecuteAction={handleExecuteCopilotAction}
        isProcessing={isProcessing}
      />

      {/* MULTI-FORMAT BOM INGESTION MODAL (CSV, XLSX, PDF AI PARSER) */}
      <BOMIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={async (filename, ingestedDag, lineCount) => {
          setIsProcessing(true);
          try {
            const finalDag = (ingestedDag && ingestedDag.nodes && ingestedDag.nodes.length > 0)
              ? ingestedDag
              : await api.getSupplyChainDAG();

            if (finalDag && finalDag.nodes && finalDag.nodes.length > 0) {
              setDagData(finalDag);

              // Register custom BOM preset dynamically in BOM_PRESETS_CATALOG
              const cleanBase = filename.replace(/\.[^/.]+$/, '').slice(0, 16);
              const customKey = 'CUSTOM_' + filename.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20);
              const primaryChokepointNode = finalDag.nodes.find((n) => n.isSPOF) ||
                finalDag.nodes.find((n) => n.tier === 3) ||
                finalDag.nodes[0];

              BOM_PRESETS_CATALOG[customKey] = {
                key: customKey,
                badge: cleanBase.toUpperCase(),
                title: `Custom Ingested: ${filename}`,
                shortTitle: cleanBase,
                industry: 'Enterprise Ingested Architecture',
                description: `${finalDag.nodes.length} nodes parsed from ${filename}. Directed Acyclic Graph constructed in PostgreSQL CTE pipeline.`,
                nodeCount: finalDag.nodes.length,
                primaryChokepoint: `${primaryChokepointNode?.name || 'Chokepoint Node'} (${primaryChokepointNode?.country || 'Transit Corridor'} // SPOF)`,
                primaryChokepointSupplierId: primaryChokepointNode?.id || 'custom-chokepoint',
                defaultSpendUSD: `$${Math.round(finalDag.nodes.reduce((s, n) => s + (n.spend || 0), 0) * 1000000).toLocaleString()}`,
              };

              setActiveBOMKey(customKey);
              setIsDisrupted(false);
              setActiveMemo(null);
            }

            const analytics = await api.getPortfolioAnalytics();
            if (analytics) setPortfolioData(analytics);
          } catch (err) {
            console.error('Error reloading graph after ingestion', err);
          } finally {
            setIsProcessing(false);
          }
        }}
      />
    </div>
  );
}

