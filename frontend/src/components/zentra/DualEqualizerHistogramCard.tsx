'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export const DualEqualizerHistogramCard: React.FC = () => {
  // Days of week: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  // Block A Dot Counts (Emerald): Wed has 5 dots (peak)
  const blockADots = [3, 4, 6, 4, 3, 2, 3];
  // Block B Dot Counts (Sky Blue): Thu has 6 dots (highest)
  const blockBDots = [2, 4, 4, 6, 5, 3, 4];

  return (
    <div className="tactile-card p-6 select-none font-sans flex flex-col justify-between">
      {/* BLOCK A: DISRUPTION INCIDENTS */}
      <div className="pb-4 border-b border-neutral-100 dark:border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-tight">
            Disruption Incidents
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            vs last period +34,002
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tracking-tight">
            106k
          </span>
        </div>

        {/* Equalizer Stacks (Emerald) with Floating Peak Badge */}
        <div className="relative pt-4">
          {/* Floating White Pill Badge: Peak: Wed */}
          <div className="absolute left-[36%] top-0 -translate-x-1/2 -translate-y-1 pointer-events-none">
            <div className="tactile-badge px-2 py-0.5 text-[9px] font-bold font-mono text-neutral-800 dark:text-white shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Peak: Wed</span>
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
            Monitored Vendors
          </span>
          <span className="text-[11px] font-mono text-blue-600 dark:text-sky-400 font-semibold">
            vs last period +320
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tracking-tight">
            1,284
          </span>
        </div>

        {/* Equalizer Stacks (Electric Sky Blue) with Floating Highest Badge */}
        <div className="relative pt-4">
          {/* Floating White Pill Badge: Highest: Thu */}
          <div className="absolute left-[50%] top-0 -translate-x-1/2 -translate-y-1 pointer-events-none">
            <div className="tactile-badge px-2 py-0.5 text-[9px] font-bold font-mono text-neutral-800 dark:text-white shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Highest: Thu</span>
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
