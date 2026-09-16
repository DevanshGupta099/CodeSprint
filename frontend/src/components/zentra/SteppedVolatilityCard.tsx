'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface SteppedVolatilityCardProps {
  range1?: string;
  granularity?: string;
}

export const SteppedVolatilityCard: React.FC<SteppedVolatilityCardProps> = ({
  range1 = 'Jan 01 - July 31',
  granularity = 'Daily',
}) => {
  // Compute profile based on granularity first, then range1
  let subTitle = 'Stepped transit risk index';
  let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let pathFill = 'M 10 70 L 55 70 L 55 55 L 110 55 L 110 20 L 165 20 L 165 38 L 220 38 L 220 30 L 270 30 L 270 50 L 310 50 L 310 85 L 10 85 Z';
  let pathStroke = 'M 10 70 L 55 70 L 55 55 L 110 55 L 110 20 L 165 20 L 165 38 L 220 38 L 220 30 L 270 30 L 270 50 L 310 50';
  let peakCx = 138;
  let peakCy = 20;
  let peakBadgeLeft = '44%';
  let peakPercent = '42%';

  if (granularity === 'Hourly CTE') {
    subTitle = 'Intraday CTE shockwave index';
    labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    pathFill = 'M 10 75 L 50 75 L 50 60 L 105 60 L 105 35 L 160 35 L 160 14 L 215 14 L 215 45 L 270 45 L 270 65 L 310 65 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 75 L 50 75 L 50 60 L 105 60 L 105 35 L 160 35 L 160 14 L 215 14 L 215 45 L 270 45 L 270 65 L 310 65';
    peakCx = 187;
    peakCy = 14;
    peakBadgeLeft = '58%';
    peakPercent = '68%';
  } else if (granularity === 'Weekly Rolling') {
    subTitle = 'Rolling 6-week volatility corridor';
    labels = ['W01', 'W04', 'W08', 'W12', 'W16', 'W20'];
    pathFill = 'M 10 65 L 60 65 L 60 50 L 120 50 L 120 28 L 180 28 L 180 34 L 235 34 L 235 48 L 280 48 L 280 60 L 310 60 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 65 L 60 65 L 60 50 L 120 50 L 120 28 L 180 28 L 180 34 L 235 34 L 235 48 L 280 48 L 280 60 L 310 60';
    peakCx = 150;
    peakCy = 28;
    peakBadgeLeft = '47%';
    peakPercent = '49%';
  } else if (granularity === 'Monthly Aggr') {
    subTitle = 'Multi-month aggregated stress metrics';
    labels = ['Q1-M1', 'Q1-M2', 'Q2-M1', 'Q2-M2', 'Q3-M1', 'Q3-M2'];
    pathFill = 'M 10 68 L 55 68 L 55 45 L 115 45 L 115 22 L 175 22 L 175 32 L 230 32 L 230 42 L 275 42 L 275 56 L 310 56 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 68 L 55 68 L 55 45 L 115 45 L 115 22 L 175 22 L 175 32 L 230 32 L 230 42 L 275 42 L 275 56 L 310 56';
    peakCx = 145;
    peakCy = 22;
    peakBadgeLeft = '45%';
    peakPercent = '56%';
  } else if (range1 === 'Q1 (Jan - Mar)') {
    subTitle = 'Q1 winter transit index';
    labels = ['Jan 01', 'Jan 15', 'Feb 01', 'Feb 15', 'Mar 01', 'Mar 15'];
    pathFill = 'M 10 72 L 60 72 L 60 62 L 115 62 L 115 38 L 170 38 L 170 48 L 225 48 L 225 55 L 275 55 L 275 68 L 310 68 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 72 L 60 72 L 60 62 L 115 62 L 115 38 L 170 38 L 170 48 L 225 48 L 225 55 L 275 55 L 275 68 L 310 68';
    peakCx = 142;
    peakCy = 38;
    peakBadgeLeft = '44%';
    peakPercent = '34%';
  } else if (range1 === 'Q2 (Apr - Jun)') {
    subTitle = 'Q2 fab output ramp variance';
    labels = ['Apr 01', 'Apr 15', 'May 01', 'May 15', 'Jun 01', 'Jun 15'];
    pathFill = 'M 10 65 L 55 65 L 55 48 L 110 48 L 110 26 L 165 26 L 165 35 L 220 35 L 220 45 L 270 45 L 270 60 L 310 60 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 65 L 55 65 L 55 48 L 110 48 L 110 26 L 165 26 L 165 35 L 220 35 L 220 45 L 270 45 L 270 60 L 310 60';
    peakCx = 137;
    peakCy = 26;
    peakBadgeLeft = '43%';
    peakPercent = '46%';
  } else if (range1 === 'Q3 (Jul - Sep)') {
    subTitle = 'Q3 Red Sea chokepoint peak';
    labels = ['Jul 01', 'Jul 15', 'Aug 01', 'Aug 15', 'Sep 01', 'Sep 15'];
    pathFill = 'M 10 68 L 50 68 L 50 52 L 105 52 L 105 32 L 160 32 L 160 16 L 220 16 L 220 36 L 275 36 L 275 52 L 310 52 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 68 L 50 68 L 50 52 L 105 52 L 105 32 L 160 32 L 160 16 L 220 16 L 220 36 L 275 36 L 275 52 L 310 52';
    peakCx = 190;
    peakCy = 16;
    peakBadgeLeft = '59%';
    peakPercent = '58%';
  } else if (range1 === 'Q4 (Oct - Dec)') {
    subTitle = 'Q4 holiday buffer compression';
    labels = ['Oct 01', 'Oct 15', 'Nov 01', 'Nov 15', 'Dec 01', 'Dec 15'];
    pathFill = 'M 10 70 L 55 70 L 55 56 L 110 56 L 110 24 L 165 24 L 165 36 L 220 36 L 220 44 L 270 44 L 270 58 L 310 58 L 310 85 L 10 85 Z';
    pathStroke = 'M 10 70 L 55 70 L 55 56 L 110 56 L 110 24 L 165 24 L 165 36 L 220 36 L 220 44 L 270 44 L 270 58 L 310 58';
    peakCx = 138;
    peakCy = 24;
    peakBadgeLeft = '43%';
    peakPercent = '51%';
  }

  return (
    <div className="tactile-card p-6 select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
            Lead-Time Volatility
          </h3>
          <span className="text-[11px] font-medium text-neutral-400 dark:text-slate-400">
            {subTitle}
          </span>
        </div>

        <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 p-1 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Stepped Staircase Area Graph with Floating Tactile White Pill Badge */}
      <div className="relative h-28 w-full my-2">
        <svg viewBox="0 0 320 85" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>

            {/* Vertical micro-hatch pattern */}
            <pattern id="micro-hatch" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#F43F5E" strokeWidth="0.75" strokeOpacity="0.15" />
            </pattern>
          </defs>

          {/* Area Fill */}
          <path
            d={pathFill}
            fill="url(#pinkGrad)"
          />
          <path
            d={pathFill}
            fill="url(#micro-hatch)"
          />

          {/* Stepped Staircase Stroke */}
          <path
            d={pathStroke}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />

          {/* Peak Point Circle */}
          <circle cx={peakCx} cy={peakCy} r="4" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {/* Floating Tactile White Pill Badge anchored to peak step point */}
        <div 
          style={{ left: peakBadgeLeft }}
          className="absolute top-0 -translate-x-1/2 -translate-y-2 pointer-events-none transition-all duration-300"
        >
          <div className="tactile-badge px-2.5 py-0.5 text-[11px] font-bold font-mono text-neutral-900 dark:text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{peakPercent}</span>
          </div>
        </div>
      </div>

      {/* Bottom Axis Labels in muted gray */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/10 text-[11px] font-medium text-neutral-400 dark:text-slate-500 font-mono">
        {labels.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
};
