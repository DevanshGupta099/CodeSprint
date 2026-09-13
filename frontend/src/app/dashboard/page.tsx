'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GlobalHeader, ZentraTab } from '@/components/zentra/GlobalHeader';
import { SubHeaderToolbar } from '@/components/zentra/SubHeaderToolbar';
import { MaterialFlowFunnelCard } from '@/components/zentra/MaterialFlowFunnelCard';
import { ValueAtRiskCard } from '@/components/zentra/ValueAtRiskCard';
import { SteppedVolatilityCard } from '@/components/zentra/SteppedVolatilityCard';
import { DualEqualizerHistogramCard } from '@/components/zentra/DualEqualizerHistogramCard';
import { HeroSunsetMeshCard } from '@/components/zentra/HeroSunsetMeshCard';
import { SVGDefs } from '@/components/zentra/SVGDefs';
import { ZentraDetailModal } from '@/components/zentra/ZentraDetailModal';
import { SupplyWorkflowStudio } from '@/components/graph/SupplyWorkflowStudio';
import { ProcurementSwitchMemo } from '@/components/terminal/ProcurementSwitchMemo';
import { SupplierDetailDrawer } from '@/components/graph/SupplierDetailDrawer';
import { AICopilotModal } from '@/components/ai/AICopilotModal';
import { INITIAL_DAG_DATA } from '@/data/seed-graph';
import { SupplyChainDAGResponse, Supplier, MitigationMemo } from '@/types/supply-chain';
import { AICopilotResponse } from '@/types/ai';
import { api } from '@/services/api';

export default function VeritasSupplyDashboard() {
  const [activeTab, setActiveTab] = useState<ZentraTab>('overview');
  const [isDisrupted, setIsDisrupted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dagData, setDagData] = useState<SupplyChainDAGResponse>(INITIAL_DAG_DATA);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [avoidedCo2Total, setAvoidedCo2Total] = useState<number>(0);

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


  // 1. Trigger Disruption Sentinel for specific or default node
  const handleTriggerDisruption = useCallback(async (targetSupplierId?: string, customSeverity?: number) => {
    setIsProcessing(true);
    try {
      // Default to AML-YEM node (Apex Maritime Logistics) if no ID supplied
      const supplierId = targetSupplierId || '10000000-0000-0000-0000-000000000007';
      const severity = customSeverity || 0.94;
      const res = await api.triggerDisruption(supplierId, severity, 'GEOPOLITICAL_BLOCKADE');
      
      setIsDisrupted(true);
      if (res && res.dag) {
        setDagData(res.dag);
      }

      const memo: MitigationMemo = res?.memo || {
        id: '60000000-0000-0000-0000-000000000001',
        disruptedSupplierId: supplierId,
        alternateSupplierId: '50000000-0000-0000-0000-000000000001',
        alternateName: 'Nordic Horn Maritime Lines (Norway Cape Route)',
        priceVariancePct: 4.2,
        leadTimeDeltaDays: -3,
        avoidedScope3Tco2e: 1420.5,
        complianceRationale: 'Full compliance with UN SDG 12 (Responsible Production) & SDG 8. Bypasses Bab-el-Mandeb conflict zone utilizing low-sulfur dual-fuel fleet along South Atlantic corridor.',
        executiveSummary: 
          `CRITICAL DISRUPTION ALERT // AUTONOMOUS MITIGATION DIRECTIVE\n` +
          `Target Node [Apex Maritime Logistics] compromised by maritime security blockade at Bab-el-Mandeb Strait.\n` +
          `Recursive CTE risk wave propagated upstream: Tier-2 Voltaic Cell Dynamics and Tier-1 Apex PowerSystems GmbH.\n` +
          `Autonomous Recommendation: Execute split-order rerouting to Nordic Horn Maritime Lines (Cape Route) and secondary packaging in Vietnam & Mexico. Price variance contained to +4.2%, transit reduced by 3 days, avoiding 1,420.5 tCO2e in Scope-3 carbon emissions.`,
        generatedAt: new Date().toISOString(),
      };

      setActiveMemo(memo);
    } catch (err) {
      console.error('Trigger disruption error:', err);
      setIsDisrupted(true);
    } finally {
      setIsProcessing(false);
    }
  }, []);

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
    <div className="min-h-screen w-full tactile-canvas text-neutral-900 dark:text-slate-100 font-sans antialiased pb-20 flex flex-col">
      {/* GLOBAL SVG PATTERNS: 45-degree Candy Stripes & 3D Gradients */}
      <SVGDefs />

      {/* Breadcrumb back to Editorial Landing Page */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-3 pb-1 flex items-center justify-between text-xs font-mono text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors">
          <span>←</span> <span className="font-semibold">LANDING OVERVIEW</span>
        </Link>
        <span className="tracking-widest uppercase text-[10px] text-neutral-400">TACTICAL ENGINE // ORG_ID: 00000000-0000-0000-0000-000000000001</span>
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
      />

      {/* 2. SUB-HEADER ACTION BAR: Responsive "Overview" & Segmented Date/Widget Selectors */}
      <SubHeaderToolbar
        title={
          activeTab === 'overview'
            ? 'Overview'
            : activeTab === 'graph'
            ? 'Supply Dependency DAG'
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }
        visibleWidgets={visibleWidgets}
        onToggleWidget={(key) => setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key] }))}
        onAddWidget={() => setActiveTab('graph')}
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 flex-1 flex flex-col gap-6">
        {/* VIEW A: OVERVIEW TAB (ZENTRA BENTO GRID) */}
        {activeTab === 'overview' && (
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
                  />
                </div>
              )}

              {/* TOP RIGHT (35% -> 4 cols): Value at Risk ($41,540,000 & 3 Striped Progress Bars) */}
              {visibleWidgets.var && (
                <div className={`${visibleWidgets.funnel ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col`}>
                  <ValueAtRiskCard />
                </div>
              )}
            </div>

            {/* ROW 2: BOTTOM 3-COLUMN BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {/* Bottom Left: Stepped Volatility Area Chart */}
              {visibleWidgets.volatility && (
                <SteppedVolatilityCard />
              )}

              {/* Bottom Center: Dual Equalizer Histogram Card */}
              {visibleWidgets.equalizer && (
                <DualEqualizerHistogramCard />
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
            onTriggerDisruption={() => handleTriggerDisruption()}
            onResetBaseline={handleResetBaseline}
            isDisrupted={isDisrupted}
            isProcessing={isProcessing}
            selectedSupplier={selectedSupplier}
            onSelectSupplier={setSelectedSupplier}
            avoidedCo2Total={avoidedCo2Total}
          />
        )}
      </main>

      {/* TAB DETAIL MODAL (SUPPLIERS, DISRUPTIONS, SANCTIONS, ESG, REPORTS) */}
      <ZentraDetailModal
        activeTab={activeTab}
        onClose={() => setActiveTab('overview')}
        onTriggerDisruption={(id) => {
          handleTriggerDisruption(id);
          setActiveTab('graph');
        }}
        onSelectSupplier={(supplier) => {
          setSelectedSupplier(supplier);
          setActiveTab('graph');
        }}
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
    </div>
  );
}
