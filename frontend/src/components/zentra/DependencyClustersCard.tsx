'use client';

import React from 'react';
import { MoreHorizontal, Layers, CheckCircle2 } from 'lucide-react';

export const DependencyClustersCard: React.FC = () => {
  // Pill frequency bars for Active Smelters (Emerald) and Alternative Fabs (Blue)
  const smelterBars = [40, 65, 85, 70, 95, 60, 45, 80, 75, 90, 85, 100];
  const fabBars = [30, 50, 60, 45, 75, 85, 70, 65, 80, 90, 95, 70];

  return (
    <div className="zentra-card zentra-card-interactive p-6 flex flex-col justify-between select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Tier-N Dependency Clusters
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-tight">
            Single-Point-of-Failure Audit
          </span>
        </div>

        <button className="text-neutral-400 hover:text-neutral-700 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Split Metrics */}
      <div className="grid grid-cols-2 gap-4 my-2">
        {/* Metric 1: Active Smelters */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-neutral-600">
              Active Smelters
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
            48k
          </span>

          {/* Vertical Pill Frequency Bars (Emerald) */}
          <div className="flex items-end gap-1 h-9 mt-1">
            {smelterBars.map((height, i) => (
              <div
                key={`smelter-${i}`}
                className="flex-1 bg-emerald-500/85 hover:bg-emerald-500 rounded-full transition-all duration-150"
                style={{ height: `${height}%` }}
                title={`Cluster ${i + 1}: ${height}% Health`}
              />
            ))}
          </div>
        </div>

        {/* Metric 2: Alternative Fabs */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-neutral-600">
              Alternative Fabs
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
            1,284
          </span>

          {/* Vertical Pill Frequency Bars (Blue) */}
          <div className="flex items-end gap-1 h-9 mt-1">
            {fabBars.map((height, i) => (
              <div
                key={`fab-${i}`}
                className="flex-1 bg-blue-500/85 hover:bg-blue-500 rounded-full transition-all duration-150"
                style={{ height: `${height}%` }}
                title={`Backup Node ${i + 1}: ${height}% Qualified`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Health Bar */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
        <span className="font-semibold text-neutral-500 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          94.2% Redundancy Ratio
        </span>
        <span className="text-neutral-400 font-mono">
          26 Nodes Tracked
        </span>
      </div>
    </div>
  );
};
