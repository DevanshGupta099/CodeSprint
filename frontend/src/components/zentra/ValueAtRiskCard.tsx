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

export const ValueAtRiskCard: React.FC = () => {
  const categories: ValueCategory[] = [
    {
      label: 'Semiconductor Allocation',
      amount: '$26,800,000',
      pct: 64,
      patternUrl: 'url(#stripe-green)',
      baseColor: '#10B981',
    },
    {
      label: 'Mineral Smelting Contracts',
      amount: '$10,400,000',
      pct: 25,
      patternUrl: 'url(#stripe-blue)',
      baseColor: '#3B82F6',
    },
    {
      label: 'Freight & Maritime Transit',
      amount: '$4,340,000',
      pct: 11,
      patternUrl: 'url(#stripe-pink)',
      baseColor: '#F43F5E',
    },
  ];

  return (
    <div className="tactile-card p-6 sm:p-7 select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
          Total Value at Risk
        </h3>
        <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 p-1 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Large Display Value: $41,540,000 in heavy geometric sans with Inline Pill Badge ▲ 15% */}
      <div className="flex items-center gap-3 my-2">
        <span className="text-[38px] sm:text-[44px] font-extrabold font-mono text-neutral-900 dark:text-white tracking-tight leading-none">
          $41,540,000
        </span>

        {/* Inline Pill Badge: ▲ 15% with green upward triangle and tactile drop shadow */}
        <div className="tactile-badge px-2.5 py-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
          <ArrowUp className="w-3 h-3 stroke-[3]" />
          <span>15%</span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium mb-4">
        Cumulative exposure across 14 Tier-1 to Tier-4 supply corridors
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
