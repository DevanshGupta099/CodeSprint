'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlobalHeader } from '../../components/zentra/GlobalHeader';
import { SubHeaderToolbar } from '../../components/zentra/SubHeaderToolbar';
import { SupplyWorkflowStudio } from '../../components/graph/SupplyWorkflowStudio';
import { ProcurementSwitchMemo } from '../../components/terminal/ProcurementSwitchMemo';
import { AICopilotModal } from '../../components/ai/AICopilotModal';
import { BOMIngestionModal } from '../../components/ingestion/BOMIngestionModal';
import { SVGDefs } from '../../components/zentra/SVGDefs';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { BOM_PRESETS_CATALOG, buildContextualMitigationMemo } from '../../data/bom-presets';
import { SupplyChainDAGResponse, Supplier, MitigationMemo } from '../../types/supply-chain';
import { AICopilotResponse } from '../../types/ai';
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
  const [activeBOMKey, setActiveBOMKey] = useState<string>('EV_BATTERY_PACK');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // AI Copilot state
  const [copilotResponse, setCopilotResponse] = useState<AICopilotResponse | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    api.getSupplyChainDAG()
      .then((data) => {
        if (isMounted && data && data.nodes) setDagData(data);
      })
      .catch((err) => {
        console.warn('Backend offline, running on simulated DAG baseline:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Switch Active BOM Preset
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
    } catch (err) {
      console.error('BOM preset switch error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Trigger Disruption Sentinel
  const handleTriggerDisruption = useCallback(async (customSupplierId?: string, customSeverity?: number) => {
    setIsProcessing(true);
    try {
      const defaultSupplierId = BOM_PRESETS_CATALOG[activeBOMKey]?.primaryChokepointSupplierId || '30000000-0000-0000-0000-000000000001';
      const targetSupplierId = customSupplierId || defaultSupplierId;
      const severity = customSeverity || 0.94;
      const res = await api.triggerDisruption(targetSupplierId, severity, 'GEOPOLITICAL_BLOCKADE');
      
      setIsDisrupted(true);
      if (res && res.dag) {
        setDagData(res.dag);
      }

      const memo: MitigationMemo = res?.memo || buildContextualMitigationMemo(targetSupplierId, dagData, activeBOMKey);
      setActiveMemo(memo);
    } catch (err) {
      console.error('Trigger disruption error:', err);
      setIsDisrupted(true);
      const defaultSupplierId = BOM_PRESETS_CATALOG[activeBOMKey]?.primaryChokepointSupplierId || '30000000-0000-0000-0000-000000000001';
      const targetSupplierId = customSupplierId || defaultSupplierId;
      setActiveMemo(buildContextualMitigationMemo(targetSupplierId, dagData, activeBOMKey));
    } finally {
      setIsProcessing(false);
    }
  }, [activeBOMKey, dagData]);

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

  // AI Copilot Query Execution
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

  // Execute Action directly from AI Copilot Modal
  const handleExecuteCopilotAction = useCallback(async (response: AICopilotResponse) => {
    if (response.suggestedAction === 'SIMULATE_DISRUPTION') {
      const targetId = response.suggestedPayload?.supplierId || response.recommendations.targetSupplierId;
      const severity = response.suggestedPayload?.severity || 0.94;
      await handleTriggerDisruption(targetId, severity);
      setIsCopilotOpen(false);
    } else if (response.suggestedAction === 'EXECUTE_REROUTE') {
      if (activeMemo) {
        await handleExecuteReroute();
      } else {
        await handleTriggerDisruption(response.recommendations.targetSupplierId);
      }
      setIsCopilotOpen(false);
    } else if (response.suggestedAction === 'INSPECT_SUPPLIER') {
      const targetId = response.suggestedPayload?.supplierId || response.recommendations.targetSupplierId;
      const node = dagData.nodes.find(n => n.id === targetId);
      if (node) setSelectedSupplier(node);
      setIsCopilotOpen(false);
    } else {
      setIsCopilotOpen(false);
    }
  }, [handleTriggerDisruption, handleExecuteReroute, activeMemo, dagData]);

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
        activeBOMKey={activeBOMKey}
        onSelectBOM={handleSelectBOM}
        onOpenIngest={() => setIsIngestModalOpen(true)}
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

      {/* 5. MULTIMODAL BOM INGESTION MODAL */}
      <BOMIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={async (filename, ingestedDag) => {
          setIsIngestModalOpen(false);
          const finalDag = (ingestedDag && ingestedDag.nodes && ingestedDag.nodes.length > 0)
            ? ingestedDag
            : await api.getSupplyChainDAG();

          if (finalDag && finalDag.nodes && finalDag.nodes.length > 0) {
            setDagData(finalDag);
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
        }}
      />

      {/* 6. CONTEXTUAL AI COPILOT MODAL */}
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
