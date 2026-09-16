'use client';

import React from 'react';
import { MoreHorizontal, ArrowUp } from 'lucide-react';

interface ValueCategory {
  label: string;
  amount: string;
  pct: number;
  patternUrl: string;
  baseColor: string;
}

interface ValueAtRiskCardProps {
  totalSpendAtRiskUSD?: number;
  isDisrupted?: boolean;
  range1?: string;
  range2?: string;
  granularity?: string;
}

const RANGE_FACTORS: Record<string, number> = {
  'Q1 (Jan - Mar)': 0.32,
  'Q2 (Apr - Jun)': 0.44,
  'Q3 (Jul - Sep)': 0.58,
  'Q4 (Oct - Dec)': 0.72,
  'H1 (Jan - Jun)': 0.76,
  'YTD Baseline': 0.90,
  'Jan 01 - July 31': 1.0,
};

export const ValueAtRiskCard: React.FC<ValueAtRiskCardProps> = ({
  totalSpendAtRiskUSD,
  isDisrupted = false,
  range1 = 'Jan 01 - July 31',
  range2 = 'Aug 01 - Dec 31',
  granularity = 'Daily',
}) => {
  const factor = RANGE_FACTORS[range1] ?? 1.0;
  const baseNominal = 12000000;
  const baseDisrupted = 41540000;

  const effectiveTotalUSD = isDisrupted 
    ? Math.round(baseDisrupted * factor) 
    : totalSpendAtRiskUSD && totalSpendAtRiskUSD !== 12000000 
    ? Math.round(totalSpendAtRiskUSD * factor)
    : Math.round(baseNominal * factor);

  const displayAmount = `$${effectiveTotalUSD.toLocaleString('en-US')}`;

  const semiAmount = Math.round(effectiveTotalUSD * (isDisrupted ? 0.64 : 0.60));
  const mineralAmount = Math.round(effectiveTotalUSD * (isDisrupted ? 0.25 : 0.30));
  const freightAmount = effectiveTotalUSD - semiAmount - mineralAmount;

  const categories: ValueCategory[] = [
    {
      label: 'Semiconductor Allocation',
      amount: `$${semiAmount.toLocaleString('en-US')}`,
      pct: isDisrupted ? 64 : 60,
      patternUrl: 'url(#stripe-green)',
      baseColor: '#10B981',
    },
    {
      label: 'Mineral Smelting Contracts',
      amount: `$${mineralAmount.toLocaleString('en-US')}`,
      pct: isDisrupted ? 25 : 30,
      patternUrl: 'url(#stripe-blue)',
      baseColor: '#3B82F6',
    },
    {
      label: 'Freight & Maritime Transit',
      amount: `$${freightAmount.toLocaleString('en-US')}`,
      pct: isDisrupted ? 11 : 10,
      patternUrl: 'url(#stripe-pink)',
      baseColor: '#F43F5E',
    },
  ];

  return (
    <div className="tactile-card p-6 sm:p-7 select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between pb-1">
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
            Total Value at Risk
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono text-neutral-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
            <span className="truncate max-w-[200px]">{range1} vs {range2}</span>
            <span>·</span>
            <span className="font-semibold text-neutral-700 dark:text-slate-300">{granularity}</span>
          </div>
        </div>
        <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 p-1 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Large Display Value */}
      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 my-2">
        <span 
          suppressHydrationWarning
          className={`text-3xl xs:text-4xl sm:text-[42px] font-extrabold font-mono tracking-tight leading-none ${
          isDisrupted ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'
        }`}>
          {displayAmount}
        </span>

        {/* Inline Pill Badge */}
        {isDisrupted ? (
          <div className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono shadow-xs animate-pulse shrink-0">
            <ArrowUp className="w-3 h-3 stroke-[3]" />
            <span>+245%</span>
          </div>
        ) : (
          <div className="tactile-badge px-2.5 py-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono shadow-xs shrink-0">
            <span>NOMINAL</span>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium mb-4">
        {isDisrupted 
          ? 'CRITICAL ALERT // Active CTE shockwave propagating upstream' 
          : `Standard operational baseline computed for ${range1} corridor`}
      </p>

      {/* Three Categorized Progress Bars (Striped 3D Pills) */}
      <div className="flex flex-col gap-4 pt-1">
        {categories.map((cat, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {/* Label + Value Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-slate-300">
                {cat.label}
              </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {cat.amount}
              </span>
            </div>

            {/* Progress Bar: Rounded-full track (bg-neutral-100 h-3.5) filled with 3D candy-stripe pattern */}
            <div className="w-full h-3.5 rounded-full bg-neutral-100 dark:bg-slate-800/90 overflow-hidden p-0.5 border border-black/[0.04] dark:border-white/10 shadow-inner">
              <svg className="w-full h-full rounded-full overflow-hidden" preserveAspectRatio="none">
                <rect
                  x="0"
                  y="0"
                  width={`${cat.pct}%`}
                  height="100%"
                  rx="6"
                  fill={cat.patternUrl}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Readout */}
      <div className="pt-4 border-t border-neutral-100 dark:border-white/10 mt-4 flex items-center justify-between text-[11px] text-neutral-400 dark:text-slate-500 font-medium">
        <span>Mitigation Capacity: High</span>
        <span className="text-neutral-700 dark:text-slate-300 font-semibold font-mono">3 Pre-Qualified Reroutes</span>
      </div>
    </div>
  );
};
