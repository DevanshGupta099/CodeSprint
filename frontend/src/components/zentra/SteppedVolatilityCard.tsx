'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export const SteppedVolatilityCard: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="tactile-card p-6 select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
            Lead-Time Volatility
          </h3>
          <span className="text-[11px] font-medium text-neutral-400">
            Stepped transit risk index
          </span>
        </div>

        <button className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Stepped Staircase Area Graph with Floating Tactile White Pill Badge 42% */}
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
            d="M 10 70 L 55 70 L 55 55 L 110 55 L 110 20 L 165 20 L 165 38 L 220 38 L 220 30 L 270 30 L 270 50 L 310 50 L 310 85 L 10 85 Z"
            fill="url(#pinkGrad)"
          />
          <path
            d="M 10 70 L 55 70 L 55 55 L 110 55 L 110 20 L 165 20 L 165 38 L 220 38 L 220 30 L 270 30 L 270 50 L 310 50 L 310 85 L 10 85 Z"
            fill="url(#micro-hatch)"
          />

          {/* Stepped Staircase Stroke */}
          <path
            d="M 10 70 L 55 70 L 55 55 L 110 55 L 110 20 L 165 20 L 165 38 L 220 38 L 220 30 L 270 30 L 270 50 L 310 50"
            fill="none"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />

          {/* Peak Point Circle */}
          <circle cx="138" cy="20" r="4" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {/* Floating Tactile White Pill Badge 42% anchored to peak step point */}
        <div className="absolute left-[44%] top-0 -translate-x-1/2 -translate-y-2 pointer-events-none">
          <div className="tactile-badge px-2.5 py-0.5 text-[11px] font-bold font-mono text-neutral-900 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>42%</span>
          </div>
        </div>
      </div>

      {/* Bottom Axis Labels: Jan, Feb, Mar, Apr, May, Jun in muted gray */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] font-medium text-neutral-400 font-mono">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
};
