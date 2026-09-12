'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WebGLGridCanvas } from '../components/canvas/WebGLGridCanvas';
import { ZeroHeader } from '../components/telemetry/ZeroHeader';
import { OrbitalDisruptionTrigger } from '../components/controls/OrbitalDisruptionTrigger';
import { FlowCanvas } from '../components/graph/FlowCanvas';
import { ProcurementSwitchMemo } from '../components/terminal/ProcurementSwitchMemo';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsDashboard';
import { BOMUploadModal } from '../components/ingestion/BOMUploadModal';
import { api } from '../services/api';
import { 
  SupplyChainDAGResponse, 
  RiskStateResponse, 
  MitigationMemo, 
  Supplier, 
  DisruptionScenario,
  PortfolioBreakdownResponse
} from '../types/supply-chain';
import { Shield, MapPin, DollarSign, Clock, Award, X, AlertTriangle } from 'lucide-react';

export default function CommandCenterPage() {
  const [dag, setDag] = useState<SupplyChainDAGResponse | null>(null);
  const [riskState, setRiskState] = useState<RiskStateResponse | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeMemo, setActiveMemo] = useState<MitigationMemo | null>(null);
  const [scenarios, setScenarios] = useState<DisruptionScenario[]>([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('red-sea');
  const [activeTierFilter, setActiveTierFilter] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecutingReroute, setIsExecutingReroute] = useState(false);
  
  // Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioBreakdownResponse | null>(null);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const [initialDag, initialRisk, scenarioList] = await Promise.all([
        api.getSupplyChainDAG(),
        api.getRiskState(),
        api.getScenarios(),
      ]);
      setDag(initialDag);
      setRiskState(initialRisk);
      setScenarios(scenarioList);
    };
    init();
  }, []);

  // Poll risk telemetry every 4 seconds to sync live metrics
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Simulate Disruption Sentinel Action
  const handleSimulateDisruption = useCallback(async (scenarioKey: string) => {
    if (!dag) return;
    setIsProcessing(true);

    const scenario = scenarios.find(s => s.key === scenarioKey) || scenarios[0];
    const targetNode = dag.nodes.find(n => n.code === scenario.targetSupplierCode) || dag.nodes[6]; // Bab-el-Mandeb

    try {
      const result = await api.triggerDisruption(
        targetNode.id,
        scenario.severity,
        scenario.disruptionType
      );
      setDag(result.dag);
      setActiveMemo(result.memo);
      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
    } finally {
      setIsProcessing(false);
    }
  }, [dag, scenarios]);

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
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 3. Execute Reroute Action
  const handleExecuteReroute = useCallback(async () => {
    if (!activeMemo) return;
    setIsExecutingReroute(true);
    try {
      const result = await api.executeReroute(
        activeMemo.disruptedSupplierId,
        activeMemo.alternateSupplierId
      );
      if (result.updatedDAG) {
        setDag(result.updatedDAG);
      }
      setActiveMemo(null);
      const updatedRisk = await api.getRiskState();
      setRiskState(updatedRisk);
    } finally {
      setIsExecutingReroute(false);
    }
  }, [activeMemo]);

  // 4. Open Analytics Modal
  const handleOpenAnalytics = useCallback(async () => {
    const data = await api.getPortfolioAnalytics();
    setPortfolioData(data);
    setIsAnalyticsOpen(true);
  }, []);

  // Filter or highlight nodes by selected tier from timeline ruler
  const filteredDag = React.useMemo(() => {
    if (!dag) return null;
    if (activeTierFilter === null) return dag;
    // Highlight or filter nodes belonging to activeTierFilter
    const matchedNode = dag.nodes.find(n => n.tier === activeTierFilter);
    if (matchedNode && !selectedSupplier) {
      // Auto select node in that tier
      setSelectedSupplier(matchedNode);
    }
    return dag;
  }, [dag, activeTierFilter, selectedSupplier]);

  const isDisrupted = (riskState?.portfolioMetrics?.activeDisruptionsCount || 0) > 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#07090E]">
      {/* 1. Ambient Zero Radial Atmosphere */}
      <div className="zero-bg-ambient" />

      {/* 2. WebGL Background Coordinate Grid & Shockwave Canvas */}
      <WebGLGridCanvas isDisrupted={isDisrupted} />

      {/* 3. Floating Zero-Style Pill Header with Scrubbable Timeline Ruler */}
      <ZeroHeader
        riskState={riskState}
        onOpenAnalytics={handleOpenAnalytics}
        onOpenIngest={() => setIsIngestOpen(true)}
        onReset={handleReset}
        activeTierFilter={activeTierFilter}
        onSelectTier={setActiveTierFilter}
        isProcessing={isProcessing}
      />

      {/* 4. Main React Flow Canvas Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden z-10 pt-16 pb-20">
        {filteredDag ? (
          <FlowCanvas
            dag={filteredDag}
            onSelectSupplier={setSelectedSupplier}
            selectedSupplierId={selectedSupplier?.id}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-cyan-400 text-xs">
            <span className="hud-shimmer-text font-bold tracking-widest uppercase">
              [INITIALIZING RECURSIVE CTE GRAPH PIPELINE...]
            </span>
          </div>
        )}

        {/* 5. Zero-Style Selected Supplier Node Inspector Drawer */}
        {selectedSupplier && (
          <div className="absolute max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[50vh] max-sm:overflow-y-auto sm:top-20 sm:left-6 sm:w-80 zero-card rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] z-20 font-mono text-xs border-white/15">
            {/* Top Specular Micro-Bevel */}
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] text-cyan-300 tracking-wider">
                TIER {selectedSupplier.tier} NODE
              </span>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="font-display font-black text-base text-white tracking-tight uppercase mb-0.5">
              {selectedSupplier.name}
            </h2>
            <div className="text-[11px] text-slate-400 mb-3">
              {selectedSupplier.code} · {selectedSupplier.materialCategory}
            </div>

            {selectedSupplier.isSPOF && (
              <div className="mb-3 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-300 font-bold text-[10px] flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Single Point of Failure (SPOF)</span>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/10 text-slate-300 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Geography:
                </span>
                <span className="font-semibold text-white">
                  {selectedSupplier.country} ({selectedSupplier.countryCode})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Annual Spend:
                </span>
                <span className="font-semibold text-white">${selectedSupplier.spend}M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Lead Time:
                </span>
                <span className="font-semibold text-white">{selectedSupplier.leadTimeDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Current Risk:
                </span>
                <span className={`font-bold ${
                  selectedSupplier.status === 'CRITICAL' ? 'text-rose-400' :
                  selectedSupplier.status === 'ELEVATED' ? 'text-amber-400' : 'text-cyan-300'
                }`}>
                  {Math.round((selectedSupplier.riskScore || 0) * 100)}% [{selectedSupplier.status}]
                </span>
              </div>
            </div>

            {/* Certifications */}
            {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/10">
                <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
                  <Award className="w-3 h-3 text-cyan-400" /> AUDIT CERTIFICATIONS:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSupplier.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-300"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Orbital Ripple Disruption Trigger */}
        <OrbitalDisruptionTrigger
          scenarios={scenarios}
          selectedScenarioKey={selectedScenarioKey}
          onSelectScenario={setSelectedScenarioKey}
          onSimulate={handleSimulateDisruption}
          isProcessing={isProcessing}
          isDisrupted={isDisrupted}
          onReset={handleReset}
        />

        {/* 7. Zero-Style Floating Terminal Procurement Memo */}
        <ProcurementSwitchMemo
          memo={activeMemo}
          onExecuteReroute={handleExecuteReroute}
          isExecuting={isExecutingReroute}
          onClose={() => setActiveMemo(null)}
        />
      </main>

      {/* 8. Modals */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        data={portfolioData}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <BOMUploadModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onUploadSuccess={(filename) => {
          api.getSupplyChainDAG().then(setDag);
        }}
      />
    </div>
  );
}
