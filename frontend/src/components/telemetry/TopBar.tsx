'use client';

import React from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  BarChart3, 
  Upload, 
  ShieldAlert, 
  Leaf, 
  DollarSign,
  Activity
} from 'lucide-react';
import { RiskStateResponse, DisruptionScenario } from '../../types/supply-chain';

interface TopBarProps {
  riskState: RiskStateResponse | null;
  onSimulateDisruption: (scenarioKey: string) => void;
  onReset: () => void;
  onOpenAnalytics: () => void;
  onOpenIngest: () => void;
  scenarios: DisruptionScenario[];
  selectedScenarioKey: string;
  onSelectScenario: (key: string) => void;
  isProcessing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  riskState,
  onSimulateDisruption,
  onReset,
  onOpenAnalytics,
  onOpenIngest,
  scenarios,
  selectedScenarioKey,
  onSelectScenario,
  isProcessing,
}) => {
  const activeDisruptions = riskState?.portfolioMetrics?.activeDisruptionsCount || 0;
  const spendAtRisk = riskState?.portfolioMetrics?.totalSpendAtRiskUSD || 0;
  const avoidedScope3 = riskState?.portfolioMetrics?.avoidedScope3Tco2e || 0;

  return (
    <header className="w-full bg-[#07090E]/95 border-b border-white/10 backdrop-blur-md px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 font-mono">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-none animate-pulse" />
          <h1 className="font-display font-extrabold text-lg text-white tracking-tighter uppercase">
            Veritas<span className="text-cyan-400">Supply</span>
          </h1>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 tracking-wider">
            [TIER-N INTEL ENGINE]
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] tracking-wider">
          <Activity className="w-3 h-3 animate-spin" />
          <span>[SYS_ONLINE // LIVE_CTE]</span>
        </div>
      </div>

      {/* Telemetry Metric Badges */}
      <div className="flex items-center gap-3 text-xs">
        {/* Avoided Scope-3 Emissions Counter (SDG 12 Anchor) */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
          <Leaf className="w-3.5 h-3.5" />
          <span className="text-[10px] text-emerald-300/80">AVOIDED SCOPE-3:</span>
          <span className="font-bold text-white text-xs">
            {avoidedScope3.toLocaleString()} <span className="text-[10px] text-emerald-400 font-normal">tCO2e</span>
          </span>
        </div>

        {/* Spend at Risk */}
        <div className={`flex items-center gap-1.5 px-3 py-1 border transition-colors ${
          spendAtRisk > 0 
            ? 'bg-rose-500/15 border-rose-500/60 text-rose-300' 
            : 'bg-slate-900 border-white/10 text-slate-400'
        }`}>
          <DollarSign className="w-3.5 h-3.5" />
          <span className="text-[10px]">SPEND AT RISK:</span>
          <span className={`font-bold text-xs ${spendAtRisk > 0 ? 'text-rose-400 font-mono' : 'text-slate-300'}`}>
            ${spendAtRisk.toFixed(1)}M
          </span>
        </div>

        {/* Active Disruptions Count */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 border ${
          activeDisruptions > 0
            ? 'bg-rose-950/70 border-rose-500 text-rose-400 animate-pulse font-bold'
            : 'bg-slate-900 border-white/10 text-slate-400'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase">
            [{activeDisruptions} DISRUPTIONS ACTIVE]
          </span>
        </div>
      </div>

      {/* Action Controls & Disruption Sentinel Trigger */}
      <div className="flex items-center gap-2">
        {/* Scenario Selector */}
        <select
          value={selectedScenarioKey}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="bg-black/60 border border-white/20 text-slate-200 text-xs px-2.5 py-1.5 outline-none focus:border-cyan-400 hover:border-white/40 cursor-pointer font-mono"
        >
          {scenarios.map((sc) => (
            <option key={sc.key} value={sc.key} className="bg-[#0B0F19] text-white">
              {sc.key.toUpperCase()}: {sc.title.substring(0, 24)}...
            </option>
          ))}
        </select>

        {/* Primary [SIMULATE RED SEA BLOCKADE] Button */}
        <button
          onClick={() => onSimulateDisruption(selectedScenarioKey)}
          disabled={isProcessing}
          className="relative group px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500 text-rose-300 hover:text-white transition-all text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,46,84,0.3)] hover:shadow-[0_0_25px_rgba(255,46,84,0.6)] disabled:opacity-50 cursor-pointer"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400 group-hover:animate-spin" />
          <span>[SIMULATE DISRUPTION]</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isProcessing}
          title="Reset graph to nominal"
          className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Analytics Modal Trigger */}
        <button
          onClick={onOpenAnalytics}
          title="View Portfolio Risk Dashboards"
          className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* BOM Ingest Trigger */}
        <button
          onClick={onOpenIngest}
          title="Ingest BOM CSV"
          className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
