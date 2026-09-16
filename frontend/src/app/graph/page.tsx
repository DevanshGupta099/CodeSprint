'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlobalHeader } from '../../components/zentra/GlobalHeader';
import { SubHeaderToolbar } from '../../components/zentra/SubHeaderToolbar';
import { SupplyWorkflowStudio } from '../../components/graph/SupplyWorkflowStudio';
import { ProcurementSwitchMemo } from '../../components/terminal/ProcurementSwitchMemo';
import { SVGDefs } from '../../components/zentra/SVGDefs';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { SupplyChainDAGResponse, Supplier, MitigationMemo } from '../../types/supply-chain';
import { api } from '../../services/api';
import { useRouter } from 'next/navigation';

export default function GraphWorkflowPage() {
  const router = useRouter();
  const [isDisrupted, setIsDisrupted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dagData, setDagData] = useState<SupplyChainDAGResponse>(INITIAL_DAG_DATA);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [avoidedCo2Total, setAvoidedCo2Total] = useState<number>(0);

  // Fetch initial DAG from backend API
  useEffect(() => {
    let isMounted = true;
    api.getSupplyChainDAG().then((data) => {
      if (isMounted && data && data.nodes) {
        setDagData(data);
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // Trigger Disruption Sentinel ([SIMULATE RED SEA BLOCKADE] or node-specific shock)
  const handleTriggerDisruption = useCallback(async (customSupplierId?: string) => {
    setIsProcessing(true);
    try {
      const targetSupplierId = customSupplierId || '30000000-0000-0000-0000-000000000001'; // AML-YEM (Apex Maritime Logistics)
      const res = await api.triggerDisruption(targetSupplierId, 0.94, 'GEOPOLITICAL_BLOCKADE');
      
      setIsDisrupted(true);
      if (res && res.dag) {
        setDagData(res.dag);
      }

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

  // Execute Reroute Action
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

  // Reset Baseline State
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
    <div className="min-h-screen w-full tactile-canvas text-neutral-900 dark:text-slate-100 font-sans antialiased pb-20 flex flex-col overflow-x-hidden">
      <SVGDefs />

      {/* 1. GLOBAL HEADER WITH TABS */}
      <GlobalHeader
        activeTab="graph"
        onSelectTab={(tab) => {
          if (tab === 'overview') {
            router.push('/dashboard');
          } else if (tab === 'reports') {
            router.push('/dashboard?tab=reports');
          } else if (tab !== 'graph') {
            router.push(`/dashboard?tab=${tab}`);
          }
        }}
        onSimulateRedSea={isDisrupted ? handleResetBaseline : () => handleTriggerDisruption()}
        isDisrupted={isDisrupted}
        isProcessing={isProcessing}
      />

      {/* 2. SUB-HEADER TOOLBAR */}
      <SubHeaderToolbar
        title="Supply Dependency DAG Studio"
        onAddWidget={() => handleTriggerDisruption()}
      />

      {/* 3. MAIN WORKSPACE */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 flex-1 flex flex-col">
        <SupplyWorkflowStudio
          dag={dagData}
          onTriggerDisruption={handleTriggerDisruption}
          onResetBaseline={handleResetBaseline}
          isDisrupted={isDisrupted}
          isProcessing={isProcessing}
          selectedSupplier={selectedSupplier}
          onSelectSupplier={setSelectedSupplier}
          avoidedCo2Total={avoidedCo2Total}
        />
      </main>

      {/* 4. TYPEWRITER PROCUREMENT SWITCH MEMO */}
      <ProcurementSwitchMemo
        memo={activeMemo}
        onExecuteReroute={handleExecuteReroute}
        isExecuting={isProcessing}
        onClose={() => setActiveMemo(null)}
      />
    </div>
  );
}
