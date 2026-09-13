'use client';

import React, { useState, useMemo } from 'react';
import { FlowCanvas } from './FlowCanvas';
import { SupplierDetailDrawer } from './SupplierDetailDrawer';
import { SupplyChainDAGResponse, Supplier } from '../../types/supply-chain';
import { 
  Zap, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Filter,
  Maximize2,
  SlidersHorizontal,
  Compass,
  TrendingDown,
  Info
} from 'lucide-react';

interface SupplyWorkflowStudioProps {
  dag: SupplyChainDAGResponse;
  onTriggerDisruption: () => void;
  onResetBaseline: () => void;
  isDisrupted: boolean;
  isProcessing: boolean;
  selectedSupplier: Supplier | null;
  onSelectSupplier: (supplier: Supplier | null) => void;
  avoidedCo2Total?: number;
}

export const SupplyWorkflowStudio: React.FC<SupplyWorkflowStudioProps> = ({
  dag,
  onTriggerDisruption,
  onResetBaseline,
  isDisrupted,
  isProcessing,
  selectedSupplier,
  onSelectSupplier,
  avoidedCo2Total = 0,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'spof'>('all');
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');

  // Filter nodes according to user selection
  const filteredDag = useMemo(() => {
    let nodes = dag.nodes;

    if (selectedTier !== 'all') {
      nodes = nodes.filter((n) => n.tier === selectedTier);
    }

    if (filterMode === 'critical') {
      nodes = nodes.filter((n) => n.status === 'CRITICAL' || n.status === 'ELEVATED');
    } else if (filterMode === 'spof') {
      nodes = nodes.filter((n) => n.isSPOF);
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = dag.edges.filter(
      (e) => nodeIds.has(e.childSupplierId) && nodeIds.has(e.parentSupplierId)
    );

    return { ...dag, nodes, edges };
  }, [dag, selectedTier, filterMode]);

  // Telemetry counts
  const criticalCount = dag.nodes.filter((n) => n.status === 'CRITICAL').length;
  const elevatedCount = dag.nodes.filter((n) => n.status === 'ELEVATED').length;
  const spofCount = dag.nodes.filter((n) => n.isSPOF).length;

  const tiers = [
    { tier: 4, name: 'Tier 4: Raw Material & Maritime', desc: 'Lithium brines, cobalt mines & Red Sea maritime choke nodes' },
    { tier: 3, name: 'Tier 3: Smelters & Chemical Refiners', desc: 'Tianqi lithium hydroxide, BASF cathode precursors, silicon' },
    { tier: 2, name: 'Tier 2: Component Manufacturers', desc: 'Voltaic cell dynamics, DriveTech inverters, BMS chips' },
    { tier: 1, name: 'Tier 1: Direct Subsystems', desc: 'Apex PowerSystems battery integration, chassis assembly' },
    { tier: 0, name: 'Tier 0: Enterprise OEM', desc: 'Veritas Automotive flagship assembly' },
  ];

  return (
    <div className="w-full flex flex-col gap-5 select-none font-sans">
      {/* 1. TIER PROGRESSION PIPELINE HEADER */}
      <div className="w-full bg-white dark:bg-[#0B0F19] rounded-[28px] border border-black/[0.06] dark:border-white/10 p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                End-To-End Autonomous DAG Workflow
              </span>
              <span className="text-xs text-neutral-400 dark:text-slate-400 font-medium">PostgreSQL Recursive CTE Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Multi-Tier Supply Chain Dependency Studio
            </h2>
            <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 max-w-2xl">
              Tracing raw materials from Tier-4 mines and maritime routes up to Tier-0 finished assembly. Disruption shocks propagate upwards with 0.7x exponential risk decay.
            </p>
          </div>

          {/* Action trigger & Reset buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={isDisrupted ? onResetBaseline : onTriggerDisruption}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-full text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] ${
                isDisrupted
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-950 animate-pulse'
                  : 'bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-neutral-300 dark:shadow-slate-900'
              }`}
            >
              {isDisrupted ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET BASELINE CTE</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SIMULATE RED SEA BLOCKADE</span>
                </>
              )}
            </button>

            <button
              onClick={() => setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'))}
              className="px-3 py-2 rounded-full bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Layout Direction"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{direction === 'LR' ? 'Horizontal Flow' : 'Vertical Waterfall'}</span>
            </button>
          </div>
        </div>

        {/* 5-STAGE WORKFLOW STEPPER CARDS */}
        <div className="flex lg:grid lg:grid-cols-5 overflow-x-auto lg:overflow-visible gap-2.5 sm:gap-3 pt-4 sm:pt-5 no-scrollbar">
          {tiers.map((t, idx) => {
            const isSelected = selectedTier === t.tier;
            const nodeCountInTier = dag.nodes.filter((n) => n.tier === t.tier).length;
            const hasDisruptionInTier = dag.nodes.some(
              (n) => n.tier === t.tier && (n.status === 'CRITICAL' || n.status === 'ELEVATED')
            );

            return (
              <button
                key={t.tier}
                onClick={() => setSelectedTier(isSelected ? 'all' : t.tier)}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden shrink-0 lg:shrink min-w-[150px] lg:min-w-0 ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 border-neutral-900 dark:border-white shadow-md scale-[1.02]'
                    : hasDisruptionInTier
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-neutral-900 dark:text-white hover:border-rose-300'
                    : 'bg-neutral-50/70 dark:bg-slate-900/80 hover:bg-neutral-100/80 dark:hover:bg-slate-800/80 border-black/[0.04] dark:border-white/10 text-neutral-900 dark:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950'
                          : hasDisruptionInTier
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 border border-black/[0.05] dark:border-white/10'
                      }`}
                    >
                      Stage 0{5 - t.tier} · Tier {t.tier}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isSelected ? 'text-neutral-300 dark:text-slate-600' : 'text-neutral-400 dark:text-slate-500'
                      }`}
                    >
                      {nodeCountInTier} nodes
                    </span>
                  </div>
                  <h4
                    className={`font-bold text-xs leading-snug line-clamp-1 ${
                      isSelected ? 'text-white dark:text-slate-950' : 'text-neutral-900 dark:text-white'
                    }`}
                  >
                    {t.name.split(':')[1] || t.name}
                  </h4>
                </div>

                <p
                  className={`text-[10px] mt-2 line-clamp-2 ${
                    isSelected ? 'text-neutral-300 dark:text-slate-700' : 'text-neutral-500 dark:text-slate-400'
                  }`}
                >
                  {t.desc}
                </p>

                {/* Arrow connector between stages (except Tier 0) */}
                {idx < 4 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-neutral-300 dark:text-slate-600 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. LIVE FILTER BAR & STATUS METRICS STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0B0F19] px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border border-black/[0.06] dark:border-white/10 shadow-xs transition-colors">
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-500 dark:text-slate-400 font-mono uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={() => { setSelectedTier('all'); setFilterMode('all'); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
              selectedTier === 'all' && filterMode === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950'
                : 'bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({dag.nodes.length})
          </button>

          <button
            onClick={() => setFilterMode((prev) => (prev === 'critical' ? 'all' : 'critical'))}
            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'critical'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Critical Disrupted ({criticalCount + elevatedCount})
          </button>

          <button
            onClick={() => setFilterMode((prev) => (prev === 'spof' ? 'all' : 'spof'))}
            className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'spof'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            SPOF Bottlenecks ({spofCount})
          </button>
        </div>

        {/* Right: Live Telemetry Indicator */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 dark:text-slate-500">CTE Decay:</span>
            <span className="font-bold text-neutral-800 dark:text-slate-200 bg-neutral-100 dark:bg-slate-800 px-2 py-0.5 rounded">0.70x / hop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 dark:text-slate-500">Status:</span>
            <span className={`font-bold ${isDisrupted ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDisrupted ? 'CRITICAL ALERT' : 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE DAG GRAPH CANVAS */}
      <div className="w-full h-[520px] sm:h-[640px] lg:h-[740px] bg-white dark:bg-[#07090E] rounded-[28px] border border-black/[0.08] dark:border-white/10 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden relative transition-colors">
        <FlowCanvas
          dag={filteredDag}
          onSelectSupplier={onSelectSupplier}
          selectedSupplierId={selectedSupplier?.id || null}
          direction={direction}
        />

        {/* Bottom Left: Workflow Legend Card */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border border-black/[0.08] dark:border-white/10 p-3.5 rounded-2xl shadow-lg max-w-sm hidden sm:block">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-black/[0.06] dark:border-white/10">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">DAG Workflow Mechanics</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-slate-300 leading-relaxed">
            Click any supplier card to inspect its bill of materials, spend, lead time, and autonomous failover rerouting options. Click <strong>[SIMULATE RED SEA BLOCKADE]</strong> to watch recursive risk flow up the graph.
          </p>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/10 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Nominal
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Elevated (0.7x)
            </span>
            <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-600" /> Compromised (0.94x)
            </span>
          </div>
        </div>

        {/* SUPPLIER DETAIL INSPECTION DRAWER */}
        <SupplierDetailDrawer
          supplier={selectedSupplier}
          onClose={() => onSelectSupplier(null)}
          onSimulateDisruptionOnNode={() => onTriggerDisruption()}
        />
      </div>
    </div>
  );
};
