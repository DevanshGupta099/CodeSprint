'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Bespoke Geometric Multi-Tier Hexagon Glyph */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0 group`}>
        <div className="w-full h-full bg-[#0A0D14] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-cyan-400/20 pointer-events-none" />
          
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110"
          >
            {/* Tier-N Interlocking Hexagonal Network Mesh */}
            <path
              d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
              stroke="url(#veritas-gradient)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeOpacity="0.85"
            />
            {/* Core Node Prism */}
            <path
              d="M16 9L21.1962 12V18L16 21L10.8038 18V12L16 9Z"
              fill="url(#core-gradient)"
              fillOpacity="0.3"
              stroke="#60A5FA"
              strokeWidth="1.5"
            />
            {/* Internal Tri-Way Flow Links */}
            <circle cx="16" cy="15" r="2" fill="#38BDF8" />
            <line x1="16" y1="9" x2="16" y2="13" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="18" x2="17.5" y2="16" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="18" x2="14.5" y2="16" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />

            <defs>
              <linearGradient id="veritas-gradient" x1="4.74" y1="3" x2="27.25" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="0.5" stopColor="#A855F7" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="core-gradient" x1="10.8" y1="9" x2="21.2" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight font-sans">
              Veritas<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400">Supply</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider">
              ENTERPRISE
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
            Autonomous Tier-N Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
