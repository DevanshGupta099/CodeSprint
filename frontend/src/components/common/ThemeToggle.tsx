'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={(e) => toggleTheme(e)}
      className={`relative group h-8 sm:h-9 px-2.5 sm:px-3 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer border select-none font-mono ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)]'
          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-black/[0.08] shadow-[0_2px_5px_rgba(0,0,0,0.04)] hover:border-black/20 hover:shadow-[0_2px_10px_rgba(0,0,0,0.08)]'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle visual theme"
    >
      {/* Precision Geometric Contrast Aperture Glyph */}
      <div className="relative w-4 h-4 flex items-center justify-center">
        <motion.div
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="flex items-center justify-center"
        >
          <svg
            viewBox="0 0 20 20"
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isDark ? 'text-cyan-400' : 'text-neutral-800'
            }`}
            fill="none"
          >
            <circle
              cx="10"
              cy="10"
              r="7.5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M10 2.5 A7.5 7.5 0 0 1 10 17.5 Z"
              fill="currentColor"
            />
            <circle
              cx="10"
              cy="10"
              r="1"
              className={isDark ? 'fill-slate-950' : 'fill-white'}
            />
          </svg>
        </motion.div>
      </div>

      {/* Monospace Technical HUD Status Label */}
      <span className="hidden xl:inline text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono">
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
};
