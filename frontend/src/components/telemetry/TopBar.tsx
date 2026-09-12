'use client';

import React from 'react';
import { 
  RotateCcw, 
  BarChart3, 
  Upload, 
  ShieldAlert, 
  Leaf, 
  DollarSign,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { RiskStateResponse } from '../../types/supply-chain';

interface TopBarProps {
  riskState: RiskStateResponse | null;
  onReset: () => void;
  onOpenAnalytics: () => void;
  onOpenIngest: () => void;
  isProcessing: boolean;
  activeTierFilter: number | null;
  onSelectTierFilter: (tier: number | null) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  riskState,
  onReset,
  onOpenAnalytics,
  onOpenIngest,
  isProcessing,
  activeTierFilter,
  onSelectTierFilter,
}) => {
  const activeDisruptions = riskState?.portfolioMetrics?.activeDisruptionsCount || 0;
  const spendAtRisk = riskState?.portfolioMetrics?.totalSpendAtRiskUSD || 0;
  const avoidedScope3 = riskState?.portfolioMetrics?.avoidedScope3Tco2e || 0;
  const isCritical = activeDisruptions > 0;

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-[#07090E]/95 border-b border-white/12 backdrop-blur-xl px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 font-mono shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      {/* Brand & Defense Posture */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <h1 className="font-display font-black text-sm sm:text-base text-white tracking-tighter uppercase">
            VERITAS<span className="text-cyan-400">SUPPLY</span>
          </h1>
        </div>

        {/* Defense Posture Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] tracking-wider uppercase font-bold ${
            isCritical
              ? 'border-rose-500/80 bg-rose-500/20 text-rose-300 animate-pulse'
              : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
          }`}
        >
          {isCritical ? (
            <>
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>[DEFCON 1 // CHOKEPOINT DISRUPTED]</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>[POSTURE // SECURE · 0.7x CTE ONLINE]</span>
            </>
          )}
        </div>
      </div>

      {/* Tier Filters (T4 -> T0) */}
      <div className="hidden lg:flex items-center border border-white/10 bg-black/40 text-[10px]">
        <button
          onClick={() => onSelectTierFilter(null)}
          className={`px-2.5 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
            activeTierFilter === null
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border-r border-white/10'
              : 'text-slate-400 hover:text-white border-r border-white/10'
          }`}
        >
          ALL TIERS
        </button>
        {[4, 3, 2, 1, 0].map((tier) => (
          <button
            key={tier}
            onClick={() => onSelectTierFilter(tier === activeTierFilter ? null : tier)}
            className={`px-2 py-1 transition-colors cursor-pointer ${
              tier > 0 ? 'border-r border-white/10' : ''
            } ${
              activeTierFilter === tier
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            T{tier}
          </button>
        ))}
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Avoided Scope-3 Carbon (SDG 12) */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400">
          <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[7px] sm:text-[8px] text-emerald-300/80 tracking-widest uppercase">
              AVOIDED CO2
            </span>
            <span className="font-bold text-white text-[11px] sm:text-xs">
              {avoidedScope3.toLocaleString()} <span className="text-[9px] text-emerald-400 font-normal">tCO2e</span>
            </span>
          </div>
        </div>

        {/* Spend at Risk */}
        <div
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 border transition-all ${
            spendAtRisk > 0
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(255,46,84,0.3)]'
              : 'bg-black/40 border-white/10 text-slate-400'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[7px] sm:text-[8px] tracking-widest uppercase text-slate-400">
              SPEND AT RISK
            </span>
            <span
              className={`font-bold text-[11px] sm:text-xs ${
                spendAtRisk > 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              ${spendAtRisk.toFixed(1)}M
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            title="Reset DAG to nominal"
            className="p-1.5 sm:p-2 bg-black/60 hover:bg-cyan-500/20 border border-white/12 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Analytics Dashboard Trigger */}
          <button
            onClick={onOpenAnalytics}
            title="Open Portfolio Risk Analytics"
            className="p-1.5 sm:p-2 bg-black/60 hover:bg-cyan-500/20 border border-white/12 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          {/* Ingestion Trigger */}
          <button
            onClick={onOpenIngest}
            title="Ingest Bill of Materials (BOM CSV)"
            className="p-1.5 sm:p-2 bg-black/60 hover:bg-cyan-500/20 border border-white/12 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
