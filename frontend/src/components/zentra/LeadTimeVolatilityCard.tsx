'use client';

import React from 'react';
import { TrendingUp, MoreHorizontal, ArrowUpRight } from 'lucide-react';

export const LeadTimeVolatilityCard: React.FC = () => {
  // Stepped SVG Path coordinates for 7 points representing days lead-time volatility
  // Points: (0, 70), (40, 70), (40, 55), (90, 55), (90, 20), (150, 20), (150, 40), (210, 40), (210, 30), (270, 30), (270, 50), (320, 50)
  
  return (
    <div className="zentra-card zentra-card-interactive p-6 flex flex-col justify-between select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Lead-Time Volatility (Days)
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-tight">
            Historical & Projected Transit Delta
          </span>
        </div>

        <button className="text-neutral-400 hover:text-neutral-700 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Stepped Line / Area Graph */}
      <div className="relative h-28 w-full mt-3 flex items-end">
        {/* SVG Stepped Curve with Rose Fill */}
        <svg viewBox="0 0 320 80" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="roseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Stepped Area Fill */}
          <path
            d="M 0 65 L 45 65 L 45 50 L 95 50 L 95 18 L 155 18 L 155 38 L 215 38 L 215 28 L 275 28 L 275 48 L 320 48 L 320 80 L 0 80 Z"
            fill="url(#roseGradient)"
          />

          {/* Stepped Stroke Line */}
          <path
            d="M 0 65 L 45 65 L 45 50 L 95 50 L 95 18 L 155 18 L 155 38 L 215 38 L 215 28 L 275 28 L 275 48 L 320 48"
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />

          {/* Active Peak Marker Circle */}
          <circle cx="125" cy="18" r="4.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {/* Floating Active Tooltip Marker (+12 Days Peak) */}
        <div className="absolute left-[38%] top-0 -translate-x-1/2 -translate-y-2">
          <div className="zentra-tooltip px-2.5 py-1 rounded-full border border-rose-100 text-[11px] font-bold font-mono text-rose-600 flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>+12 Days Peak</span>
          </div>
        </div>
      </div>

      {/* Metric Bottom Readout */}
      <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between mt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-neutral-900">
            38.4d
          </span>
          <span className="text-xs font-semibold text-rose-500 flex items-center">
            +4.2d <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <span className="text-[11px] font-medium text-neutral-400">
          Malacca & Red Sea Exposure
        </span>
      </div>
    </div>
  );
};
