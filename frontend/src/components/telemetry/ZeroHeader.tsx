'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Upload, 
  Leaf, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  Layers,
  Shield,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { RiskStateResponse } from '../../types/supply-chain';
import { RollingCounter } from '../common/RollingCounter';

interface ZeroHeaderProps {
  riskState: RiskStateResponse | null;
  onOpenAnalytics: () => void;
  onOpenIngest: () => void;
  onReset: () => void;
  activeTierFilter: number | null;
  onSelectTier: (tier: number | null) => void;
  isProcessing: boolean;
}

const TIERS = [
  { tier: 4, label: 'T4 MINES', code: 'RAW' },
  { tier: 3, label: 'T3 CHOKEPOINTS', code: 'LOG' },
  { tier: 2, label: 'T2 CELLS', code: 'SUB' },
  { tier: 1, label: 'T1 PACKS', code: 'MOD' },
  { tier: 0, label: 'T0 GIGAFACTORY', code: 'OEM' },
];

export const ZeroHeader: React.FC<ZeroHeaderProps> = ({
  riskState,
  onOpenAnalytics,
  onOpenIngest,
  onReset,
  activeTierFilter,
  onSelectTier,
  isProcessing,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const spendAtRisk = riskState?.portfolioMetrics?.totalSpendAtRiskUSD || 0;
  const avoidedScope3 = riskState?.portfolioMetrics?.avoidedScope3Tco2e || 0;
  const activeDisruptions = riskState?.portfolioMetrics?.activeDisruptionsCount || 0;

  // Gamified Resilience XP calculation (from why.zero.university)
  let xpValue = 980;
  let xpLevel = 'LVL 4 RESILIENT';
  let xpStyle = 'border-amber-400/40 text-amber-300 bg-amber-400/10';

  if (activeDisruptions > 0) {
    xpValue = 320;
    xpLevel = 'BREACH // RISK ELEVATED';
    xpStyle = 'border-rose-500/60 text-rose-300 bg-rose-950/60 animate-pulse';
  } else if (avoidedScope3 > 0) {
    xpValue = 1480;
    xpLevel = 'LVL 5 // +500 XP SECURED';
    xpStyle = 'border-emerald-400/50 text-emerald-300 bg-emerald-500/15';
  }

  return (
    <header className="fixed top-2 sm:top-4 inset-x-0 z-30 pointer-events-none px-2 sm:px-6 flex flex-col gap-2 font-mono">
      <div className="w-full flex items-center justify-between gap-2">
        {/* 1. Left Group: Floating Brand & Gamified XP Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <div className="zero-pill px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-tighter uppercase">
                VERITAS<span className="text-cyan-400">SUPPLY</span>
              </span>
            </div>

            {/* Audio Waveform Micro-Bars */}
            <button
              onClick={() => setIsAudioActive(!isAudioActive)}
              title="Telemetry Frequency Stream"
              className="hidden lg:flex items-center gap-0.5 px-1 py-0.5 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className={`w-0.5 h-3 bg-cyan-400 rounded-full ${isAudioActive ? 'wave-bar-1' : 'opacity-30'}`} />
              <span className={`w-0.5 h-3 bg-cyan-400 rounded-full ${isAudioActive ? 'wave-bar-2' : 'opacity-30'}`} />
              <span className={`w-0.5 h-3 bg-cyan-400 rounded-full ${isAudioActive ? 'wave-bar-3' : 'opacity-30'}`} />
            </button>
          </div>

          {/* Gamified Zero XP Pill */}
          <div className={`zero-pill px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold ${xpStyle}`}>
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              <RollingCounter value={xpValue} suffix="XP" decimals={0} />
            </span>
            <span className="hidden xl:inline text-[9px] opacity-80 font-normal">
              [{xpLevel}]
            </span>
          </div>
        </div>

        {/* 2. Center: Zero-Style Scrubbable Tier Timeline Ruler (Desktop & Tablet) */}
        <div className="pointer-events-auto hidden md:flex items-center">
          <div className="zero-pill px-4 py-1.5 sm:py-2 flex items-center gap-3 sm:gap-4 relative overflow-hidden">
            {/* Center indicator line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-cyan-400/40 pointer-events-none" />

            <button
              onClick={() => onSelectTier(null)}
              className={`text-[9px] sm:text-[10px] font-mono tracking-wider transition-colors uppercase ${
                activeTierFilter === null ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              [ALL TIERS]
            </button>

            <div className="h-4 w-px bg-white/10" />

            {/* Interactive Tier Ticks */}
            <div className="flex items-center gap-2.5 sm:gap-3 font-mono text-[9px] sm:text-[10px]">
              {TIERS.map((t) => {
                const isSelected = activeTierFilter === t.tier;

                return (
                  <button
                    key={t.tier}
                    onClick={() => onSelectTier(isSelected ? null : t.tier)}
                    className="group flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-px transition-all ${
                          isSelected
                            ? 'h-3.5 bg-cyan-400 shadow-[0_0_8px_#00F0FF]'
                            : 'h-2 bg-white/20 group-hover:bg-white/60'
                        }`}
                      />
                      <span
                        className={`tracking-wider ${
                          isSelected
                            ? 'text-cyan-300 font-bold'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {t.code}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Right Group: Metrics Capsules & Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Avoided Scope-3 CO2 Pill */}
          <div className="zero-pill px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 border-emerald-500/30">
            <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
              <Leaf className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[7px] sm:text-[8px] text-emerald-400 font-mono tracking-widest uppercase">
                AVOIDED CO2
              </span>
              <div className="text-[10px] sm:text-xs text-white">
                <RollingCounter
                  value={avoidedScope3}
                  suffix="t"
                  decimals={0}
                  className="text-emerald-300"
                />
              </div>
            </div>
          </div>

          {/* Spend at Risk Pill */}
          {spendAtRisk > 0 && (
            <div className="zero-pill px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 border-rose-500/40 bg-rose-950/40 animate-pulse">
              <div className="p-1 rounded-full bg-rose-500/20 text-rose-400">
                <DollarSign className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[7px] sm:text-[8px] text-rose-400 font-mono tracking-widest uppercase">
                  AT RISK
                </span>
                <div className="text-[10px] sm:text-xs text-white">
                  <RollingCounter
                    value={spendAtRisk}
                    prefix="$"
                    suffix="M"
                    decimals={1}
                    className="text-rose-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop & Mobile Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={onReset}
              disabled={isProcessing}
              title="Reset graph to nominal"
              className="zero-pill p-1.5 sm:p-2 text-slate-300 hover:text-cyan-400 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenAnalytics}
              title="Portfolio Analytics"
              className="zero-pill p-1.5 sm:p-2 text-slate-300 hover:text-cyan-400 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenIngest}
              title="Upload BOM CSV"
              className="zero-pill p-1.5 sm:p-2 text-slate-300 hover:text-cyan-400 cursor-pointer hidden sm:block"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Tier Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="zero-pill p-1.5 text-slate-300 hover:text-white md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tier Scrub Bar Dropdown */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto md:hidden zero-card p-2 rounded-2xl flex items-center justify-around gap-1">
          <button
            onClick={() => {
              onSelectTier(null);
              setIsMobileMenuOpen(false);
            }}
            className={`px-2 py-1 rounded-full text-[9px] ${
              activeTierFilter === null ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            ALL
          </button>
          {TIERS.map((t) => (
            <button
              key={t.tier}
              onClick={() => {
                onSelectTier(activeTierFilter === t.tier ? null : t.tier);
                setIsMobileMenuOpen(false);
              }}
              className={`px-2 py-1 rounded-full text-[9px] ${
                activeTierFilter === t.tier
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {t.code}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
