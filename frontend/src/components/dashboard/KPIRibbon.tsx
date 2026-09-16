'use client';

import React from 'react';
import { 
  Network, 
  DollarSign, 
  Leaf, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { RiskStateResponse } from '../../types/supply-chain';

interface KPIRibbonProps {
  riskState: RiskStateResponse | null;
  totalNodesCount: number;
  spofCount: number;
  isDisrupted: boolean;
}

export const KPIRibbon: React.FC<KPIRibbonProps> = ({
  riskState,
  totalNodesCount,
  spofCount,
  isDisrupted,
}) => {
  const spendAtRisk = riskState?.portfolioMetrics?.totalSpendAtRiskUSD || 0;
  const avoidedScope3 = riskState?.portfolioMetrics?.avoidedScope3Tco2e || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-3 border-b border-white/[0.06] bg-[#07090F]/70 shrink-0 font-sans select-none">
      {/* 1. Monitored Suppliers */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
            Monitored Suppliers
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-bold text-white text-lg font-mono">{totalNodesCount}</span>
            <span className="text-[11px] text-zinc-400 font-medium">across 5 Tiers</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Network className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Spend at Risk */}
      <div
        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
          isDisrupted
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12]'
        }`}
      >
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
            Portfolio Spend at Risk
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-bold text-white text-lg font-mono">
              ${(spendAtRisk / 1_000_000).toFixed(1)}M
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                isDisrupted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isDisrupted ? 'High Exposure' : 'Nominal'}
            </span>
          </div>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isDisrupted
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Avoided Scope-3 Carbon */}
      <div className="p-3.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-400/90 uppercase tracking-wider font-semibold">
            Avoided Scope-3 Carbon
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span suppressHydrationWarning className="font-bold text-emerald-300 text-lg font-mono">
              {avoidedScope3.toLocaleString('en-US')}
            </span>
            <span className="text-[11px] text-emerald-400/90 font-medium">tCO2e (SDG 12)</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Leaf className="w-4 h-4" />
        </div>
      </div>

      {/* 4. SPOF Bottlenecks */}
      <div className="p-3.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 transition-all flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold">
            Single Points of Failure
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-bold text-amber-300 text-lg font-mono">{spofCount}</span>
            <span className="text-[11px] text-amber-400/90 font-medium">Critical Nodes</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
