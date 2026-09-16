'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface DualEqualizerHistogramCardProps {
  granularity?: string;
  range1?: string;
  range2?: string;
}

export const DualEqualizerHistogramCard: React.FC<DualEqualizerHistogramCardProps> = ({
  granularity = 'Daily',
  range1 = 'Jan 01 - July 31',
  range2 = 'Aug 01 - Dec 31',
}) => {
  let blockATitle = 'Disruption Incidents';
  let blockAComparison = 'vs last period +34,002';
  let blockAValue = '106k';
  let blockAPeakBadge = 'Peak: Wed';
  let blockAPeakLeft = '36%';
  let blockADots = [3, 4, 6, 4, 3, 2, 3];

  let blockBTitle = 'Monitored Vendors';
  let blockBComparison = 'vs last period +320';
  let blockBValue = '1,284';
  let blockBPeakBadge = 'Highest: Thu';
  let blockBPeakLeft = '50%';
  let blockBDots = [2, 4, 4, 6, 5, 3, 4];

  if (granularity === 'Hourly CTE') {
    blockATitle = 'Intraday CTE Disruptions';
    blockAComparison = 'vs prev hour +412';
    blockAValue = '8,420';
    blockAPeakBadge = 'Peak: 14:00';
    blockAPeakLeft = '50%';
    blockADots = [2, 4, 6, 5, 3, 2, 4];

    blockBTitle = 'Active Telemetry Vendors';
    blockBComparison = 'vs prev hour +14';
    blockBValue = '184';
    blockBPeakBadge = 'Peak: 16:00';
    blockBPeakLeft = '64%';
    blockBDots = [2, 3, 4, 6, 5, 3, 2];
  } else if (granularity === 'Weekly Rolling') {
    blockATitle = 'Weekly Disruption Clusters';
    blockAComparison = 'vs last cycle +62,100';
    blockAValue = '482k';
    blockAPeakBadge = 'Peak: Wk 03';
    blockAPeakLeft = '36%';
    blockADots = [4, 5, 6, 5, 4, 3, 4];

    blockBTitle = 'Weekly Active Suppliers';
    blockBComparison = 'vs last cycle +410';
    blockBValue = '2,840';
    blockBPeakBadge = 'Highest: Wk 04';
    blockBPeakLeft = '50%';
    blockBDots = [3, 4, 5, 6, 6, 4, 5];
  } else if (granularity === 'Monthly Aggr') {
    blockATitle = 'Aggregated Incident Events';
    blockAComparison = 'vs prior year +14.2%';
    blockAValue = '1.45M';
    blockAPeakBadge = 'Peak: Aug';
    blockAPeakLeft = '64%';
    blockADots = [2, 4, 5, 4, 6, 5, 4];

    blockBTitle = 'Audited Global Vendors';
    blockBComparison = 'vs prior year +890';
    blockBValue = '5,420';
    blockBPeakBadge = 'Highest: Oct';
    blockBPeakLeft = '78%';
    blockBDots = [3, 4, 5, 5, 6, 6, 5];
  }

  return (
    <div className="tactile-card p-6 select-none font-sans flex flex-col justify-between">
      {/* BLOCK A: DISRUPTION INCIDENTS */}
      <div className="pb-4 border-b border-neutral-100 dark:border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-tight">
            {blockATitle}
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {blockAComparison}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tracking-tight">
            {blockAValue}
          </span>
        </div>

        {/* Equalizer Stacks (Emerald) with Floating Peak Badge */}
        <div className="relative pt-4">
          {/* Floating White Pill Badge */}
          <div 
            style={{ left: blockAPeakLeft }}
            className="absolute top-0 -translate-x-1/2 -translate-y-1 pointer-events-none transition-all duration-300"
          >
            <div className="tactile-badge px-2 py-0.5 text-[9px] font-bold font-mono text-neutral-800 dark:text-white shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{blockAPeakBadge}</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-14">
            {blockADots.map((count, dayIdx) => (
              <div key={`a-${dayIdx}`} className="flex-1 flex flex-col-reverse gap-1 items-center">
                {Array.from({ length: 6 }).map((_, dotIdx) => (
                  <div
                    key={`dot-a-${dayIdx}-${dotIdx}`}
                    className={`w-full max-w-[18px] h-1.5 rounded-full transition-all ${
                      dotIdx < count
                        ? 'bg-emerald-500'
                        : 'bg-neutral-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCK B: MONITORED VENDORS */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-tight">
            {blockBTitle}
          </span>
          <span className="text-[11px] font-mono text-blue-600 dark:text-sky-400 font-semibold">
            {blockBComparison}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tracking-tight">
            {blockBValue}
          </span>
        </div>

        {/* Equalizer Stacks (Electric Sky Blue) with Floating Highest Badge */}
        <div className="relative pt-4">
          {/* Floating White Pill Badge */}
          <div 
            style={{ left: blockBPeakLeft }}
            className="absolute top-0 -translate-x-1/2 -translate-y-1 pointer-events-none transition-all duration-300"
          >
            <div className="tactile-badge px-2 py-0.5 text-[9px] font-bold font-mono text-neutral-800 dark:text-white shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>{blockBPeakBadge}</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-14">
            {blockBDots.map((count, dayIdx) => (
              <div key={`b-${dayIdx}`} className="flex-1 flex flex-col-reverse gap-1 items-center">
                {Array.from({ length: 6 }).map((_, dotIdx) => (
                  <div
                    key={`dot-b-${dayIdx}-${dotIdx}`}
                    className={`w-full max-w-[18px] h-1.5 rounded-full transition-all ${
                      dotIdx < count
                        ? 'bg-sky-500'
                        : 'bg-neutral-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
