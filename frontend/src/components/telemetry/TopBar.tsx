'use client';

import React from 'react';
import { 
  RotateCcw, 
  ShieldAlert, 
  Leaf, 
  AlertTriangle,
  Play,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { RiskStateResponse } from '../../types/supply-chain';

interface TopBarProps {
  riskState: RiskStateResponse | null;
  onReset: () => void;
  onSimulateDisruption: () => void;
  isProcessing: boolean;
  viewTitle: string;
  viewSubtitle?: string;
  isDisrupted: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  riskState,
  onReset,
  onSimulateDisruption,
  isProcessing,
  viewTitle,
  viewSubtitle,
  isDisrupted,
}) => {
  const spendAtRisk = riskState?.portfolioMetrics?.totalSpendAtRiskUSD || 0;
  const avoidedScope3 = riskState?.portfolioMetrics?.avoidedScope3Tco2e || 0;

  return (
    <header className="h-16 bg-[#090C14]/95 border-b border-white/[0.08] backdrop-blur-xl px-6 flex items-center justify-between gap-4 font-sans select-none shrink-0 z-10">
      {/* View Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-none">
            {viewTitle}
          </h2>
          {viewSubtitle && (
            <p className="text-[11px] text-zinc-400 mt-1">{viewSubtitle}</p>
          )}
        </div>
      </div>

      {/* Network Status Badge (Center) */}
      <div
        className={`hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
          isDisrupted
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isDisrupted ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isDisrupted ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
        </span>
        <span>
          {isDisrupted
            ? 'Maritime Disruption Active · Bab-el-Mandeb Strait'
            : 'Supply Network Nominal · 0.7x CTE Online'}
        </span>
      </div>

      {/* Primary Telemetry & Actions (Right) */}
      <div className="flex items-center gap-3">
        {/* Spend at Risk Pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-colors ${
            isDisrupted
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-300'
          }`}
        >
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Spend at Risk:
          </span>
          <span className="font-mono font-bold text-white text-xs">
            ${(spendAtRisk / 1_000_000).toFixed(1)}M
          </span>
        </div>

        {/* Avoided Scope-3 Carbon */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
          <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold">
            Avoided CO₂:
          </span>
          <span className="font-mono font-bold text-white text-xs">
            {avoidedScope3.toLocaleString()} <span className="text-[10px] text-emerald-400 font-normal">tCO2e</span>
          </span>
        </div>

        {/* Primary Simulation CTA Button */}
        {isDisrupted ? (
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-zinc-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Restore Baseline</span>
          </button>
        ) : (
          <button
            onClick={onSimulateDisruption}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Red Sea Blockade</span>
          </button>
        )}

        {/* Graph Reset Button */}
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Reset to nominal graph state"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
};
