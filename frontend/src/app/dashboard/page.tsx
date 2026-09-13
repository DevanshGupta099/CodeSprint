'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlobalHeader, ZentraTab } from '../../components/zentra/GlobalHeader';
import { SubHeaderToolbar } from '../../components/zentra/SubHeaderToolbar';
import { MaterialFlowFunnelCard } from '../../components/zentra/MaterialFlowFunnelCard';
import { ValueAtRiskCard } from '../../components/zentra/ValueAtRiskCard';
import { SteppedVolatilityCard } from '../../components/zentra/SteppedVolatilityCard';
import { DualEqualizerHistogramCard } from '../../components/zentra/DualEqualizerHistogramCard';
import { HeroSunsetMeshCard } from '../../components/zentra/HeroSunsetMeshCard';
import { SVGDefs } from '../../components/zentra/SVGDefs';
import { ZentraDetailModal } from '../../components/zentra/ZentraDetailModal';
import { SupplyWorkflowStudio } from '../../components/graph/SupplyWorkflowStudio';
import { ProcurementSwitchMemo } from '../../components/terminal/ProcurementSwitchMemo';
import { SupplierDetailDrawer } from '../../components/graph/SupplierDetailDrawer';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { SupplyChainDAGResponse, Supplier, MitigationMemo } from '../../types/supply-chain';
import { api } from '../../services/api';

export default function VeritasSupplyDashboard() {
  const [activeTab, setActiveTab] = useState<ZentraTab>('overview');
  const [isDisrupted, setIsDisrupted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dagData, setDagData] = useState<SupplyChainDAGResponse>(INITIAL_DAG_DATA);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [avoidedCo2Total, setAvoidedCo2Total] = useState<number>(0);

  // Fetch initial DAG from backend API (or fallback to simulator)
  useEffect(() => {
    let isMounted = true;
    api.getSupplyChainDAG().then((data) => {
      if (isMounted && data && data.nodes) {
        setDagData(data);
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // 1. Trigger Disruption Sentinel (e.g. [SIMULATE RED SEA BLOCKADE])
  const handleTriggerRedSeaBlockade = useCallback(async () => {
    setIsProcessing(true);
    try {
      // AML-YEM node (Apex Maritime Logistics)
      const targetSupplierId = '10000000-0000-0000-0000-000000000007'; // Apex Maritime Logistics in seed-graph
      const res = await api.triggerDisruption(targetSupplierId, 0.94, 'GEOPOLITICAL_BLOCKADE');
      
      setIsDisrupted(true);
      if (res && res.dag) {
        setDagData(res.dag);
      }

      // Generate or set mitigation memo
      const memo: MitigationMemo = res?.memo || {
        id: '60000000-0000-0000-0000-000000000001',
        disruptedSupplierId: targetSupplierId,
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

  return (
    <div className="min-h-screen w-full tactile-canvas text-neutral-900 font-sans antialiased pb-20 flex flex-col">
      {/* GLOBAL SVG PATTERNS: 45-degree Candy Stripes & 3D Gradients */}
      <SVGDefs />

      {/* Return to Editorial Landing Nav Banner */}
      <div className="w-full bg-[#1A1917] border-b border-white/10 px-6 py-2 flex items-center justify-between font-mono text-xs text-neutral-300">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors tracking-wider font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[ RETURN TO EDITORIAL PROLOGUE ]</span>
        </Link>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TACTICAL ENGINE v2.4
          </span>
          <span className="hidden sm:inline text-neutral-500">
            LAT 22.3193° N // LNG 114.1694° E
          </span>
        </div>
      </div>

      {/* 1. HEADER & NAVIGATION: Floating Rounded Pill Nav Bar + [SIMULATE RED SEA BLOCKADE] */}
      <GlobalHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setActiveTab('suppliers')}
        onSimulateRedSea={isDisrupted ? handleResetBaseline : handleTriggerRedSeaBlockade}
        isDisrupted={isDisrupted}
        isProcessing={isProcessing}
      />

      {/* 2. SUB-HEADER ACTION BAR: "Overview" (36px) & Segmented Date Selectors */}
      <SubHeaderToolbar
        title={
          activeTab === 'overview'
            ? 'Overview'
            : activeTab === 'graph'
            ? 'Supply Dependency DAG'
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }
        onAddWidget={() => handleTriggerRedSeaBlockade()}
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 flex-1 flex flex-col gap-6">
        {/* VIEW A: OVERVIEW TAB (ZENTRA BENTO GRID) */}
        {activeTab === 'overview' && (
          <>
            {/* ROW 1: TOP HERO (65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* TOP LEFT (65% -> 8 cols): 3D Isometric Material Flow Funnel with AI Dock */}
              <div className="lg:col-span-8 flex flex-col">
                <MaterialFlowFunnelCard
                  onExplorePrompt={(prompt) => handleTriggerRedSeaBlockade()}
                  onSelectStage={(stageId) => setActiveTab('graph')}
                />
              </div>

              {/* TOP RIGHT (35% -> 4 cols): Value at Risk ($41,540,000 & 3 Striped Progress Bars) */}
              <div className="lg:col-span-4 flex flex-col">
                <ValueAtRiskCard />
              </div>
            </div>

            {/* ROW 2: BOTTOM 3-COLUMN BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Bottom Left: Stepped Volatility Area Chart ("Retention" Style) */}
              <SteppedVolatilityCard />

              {/* Bottom Center: Dual Equalizer Histogram Card ("Transactions & Customers" Style) */}
              <DualEqualizerHistogramCard />

              {/* Bottom Right: Hero Sunset Gradient AI Insight Card */}
              <HeroSunsetMeshCard
                onExploreMitigation={() => handleTriggerRedSeaBlockade()}
              />
            </div>
          </>
        )}

        {/* VIEW B: SUPPLY GRAPH TAB (SUPPLY WORKFLOW STUDIO) */}
        {activeTab === 'graph' && (
          <SupplyWorkflowStudio
            dag={dagData}
            onTriggerDisruption={handleTriggerRedSeaBlockade}
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
        onTriggerDisruption={(id) => handleTriggerRedSeaBlockade()}
      />

      {/* SUPPLIER DETAIL INSPECTION DRAWER (WHEN NODE CLICKED ON OVERVIEW) */}
      {activeTab !== 'graph' && (
        <SupplierDetailDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
          onSimulateDisruptionOnNode={(id: string) => handleTriggerRedSeaBlockade()}
        />
      )}

      {/* THE TERMINAL TYPEWRITER PROCUREMENT SWITCH MEMO ([EXECUTE_REROUTE]) */}
      <ProcurementSwitchMemo
        memo={activeMemo}
        onExecuteReroute={handleExecuteReroute}
        isExecuting={isProcessing}
        onClose={() => setActiveMemo(null)}
      />
    </div>
  );
}
