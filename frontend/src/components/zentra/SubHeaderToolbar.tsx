'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Plus, 
  Link as LinkIcon, 
  Check, 
  Layers, 
  Sparkles, 
  BarChart2, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface SubHeaderToolbarProps {
  title?: string;
  onAddWidget?: () => void;
  visibleWidgets?: {
    funnel: boolean;
    var: boolean;
    volatility: boolean;
    equalizer: boolean;
    insight: boolean;
  };
  onToggleWidget?: (widgetKey: 'funnel' | 'var' | 'volatility' | 'equalizer' | 'insight') => void;
}

export const SubHeaderToolbar: React.FC<SubHeaderToolbarProps> = ({
  title = 'Overview',
  onAddWidget,
  visibleWidgets = { funnel: true, var: true, volatility: true, equalizer: true, insight: true },
  onToggleWidget,
}) => {
  const [range1, setRange1] = useState('Jan 01 - July 31');
  const [range2, setRange2] = useState('Aug 01 - Dec 31');
  const [granularity, setGranularity] = useState('Daily');
  const [copied, setCopied] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<'range1' | 'range2' | 'granularity' | 'widgets' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const range1Options = ['Jan 01 - July 31', 'Q1 (Jan - Mar)', 'Q2 (Apr - Jun)', 'H1 (Jan - Jun)', 'YTD Baseline'];
  const range2Options = ['Aug 01 - Dec 31', 'Q3 (Jul - Sep)', 'Q4 (Oct - Dec)', 'H2 Projected', 'Full Year SLA'];
  const granularityOptions = ['Hourly CTE', 'Daily', 'Weekly Rolling', 'Monthly Aggr'];

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 select-none font-sans relative z-20"
    >
      {/* LEFT: Title in 28-36px font-semibold with circular link icon button + toast */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold tracking-tight text-neutral-900 dark:text-white leading-none transition-colors">
          {title}
        </h1>
        <button
          onClick={handleCopyLink}
          className="relative h-7 w-7 rounded-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 flex items-center justify-center text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Copy dashboard link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
        </button>

        {copied && (
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
            Link copied!
          </span>
        )}
      </div>

      {/* RIGHT SEGMENTED DATE SELECTOR & ACTIONS */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        {/* Pill 1: Range 1 Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'range1' ? null : 'range1')}
            className="tactile-pill-btn px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-neutral-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-400" />
            <span className="text-[11px] sm:text-xs">{range1}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-slate-500" />
          </button>

          {openDropdown === 'range1' && (
            <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {range1Options.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    setRange1(opt);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    range1 === opt 
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 font-semibold' 
                      : 'text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text: compared to */}
        <span className="text-neutral-400 dark:text-slate-500 text-[11px] sm:text-xs font-normal px-0.5 hidden sm:inline">
          vs
        </span>

        {/* Pill 2: Range 2 Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'range2' ? null : 'range2')}
            className="tactile-pill-btn px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-neutral-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-slate-400" />
            <span className="text-[11px] sm:text-xs">{range2}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-slate-500" />
          </button>

          {openDropdown === 'range2' && (
            <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {range2Options.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    setRange2(opt);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    range2 === opt 
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 font-semibold' 
                      : 'text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown: [ Granularity ▾ ] */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'granularity' ? null : 'granularity')}
            className="tactile-pill-btn px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-1.5 text-neutral-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <span className="text-[11px] sm:text-xs">{granularity}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-slate-500" />
          </button>

          {openDropdown === 'granularity' && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {granularityOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    setGranularity(opt);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    granularity === opt 
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 font-semibold' 
                      : 'text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Button: [ Customize Cards / Add widget + ] */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'widgets' ? null : 'widgets')}
            className="tactile-pill-btn px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 text-neutral-900 dark:text-white font-semibold cursor-pointer shadow-sm hover:bg-neutral-50 dark:hover:bg-slate-800 ml-0.5"
            title="Configure Dashboard Widgets"
          >
            <span className="text-[11px] sm:text-xs">Customize</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-700 dark:text-slate-300" />
          </button>

          {openDropdown === 'widgets' && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/10 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06] dark:border-white/10">
                <span className="font-bold text-xs text-neutral-900 dark:text-white">Dashboard Bento Cards</span>
                <button onClick={() => setOpenDropdown(null)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  { key: 'funnel' as const, label: 'Material Flow Funnel & AI' },
                  { key: 'var' as const, label: 'Value at Risk Breakdown' },
                  { key: 'volatility' as const, label: 'Lead-Time Volatility Chart' },
                  { key: 'equalizer' as const, label: 'Incident Equalizer Histogram' },
                  { key: 'insight' as const, label: 'AI Sunset Insight Card' },
                ].map(w => (
                  <button
                    key={w.key}
                    onClick={() => onToggleWidget && onToggleWidget(w.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-900/80 text-neutral-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    <span>{w.label}</span>
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                      visibleWidgets[w.key] 
                        ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-slate-950 font-bold' 
                        : 'border-neutral-300 dark:border-slate-700 text-transparent'
                    }`}>
                      {visibleWidgets[w.key] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
