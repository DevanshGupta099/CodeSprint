'use client';

import React from 'react';
import { Search, Bell, Zap, RotateCcw } from 'lucide-react';

export type ZentraTab = 
  | 'overview' 
  | 'graph'
  | 'suppliers' 
  | 'disruptions' 
  | 'sanctions' 
  | 'esg' 
  | 'reports';

interface GlobalHeaderProps {
  activeTab: ZentraTab;
  onSelectTab: (tab: ZentraTab) => void;
  onOpenSearch?: () => void;
  onSimulateRedSea?: () => void;
  isDisrupted?: boolean;
  isProcessing?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onSimulateRedSea,
  isDisrupted = false,
  isProcessing = false,
}) => {
  const tabs: { id: ZentraTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'graph', label: 'Supply Graph' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'disruptions', label: 'Disruptions' },
    { id: 'sanctions', label: 'Sanctions Watch' },
    { id: 'esg', label: 'ESG Metrics' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 pt-6 select-none font-sans">
      {/* Outer Container: Rounded pill nav bar floating at top with subtle border */}
      <header className="w-full bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3">
        {/* LEFT: Amber square emblem + bold lowercase veritas brand logo */}
        <div 
          className="flex items-center gap-2.5 shrink-0 cursor-pointer" 
          onClick={() => onSelectTab('overview')}
        >
          {/* Amber Square Emblem */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" stroke="none">
              <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zm0 3.3l6.7 4.35L12 14 5.3 9.65 12 5.3zm-7.7 6.25l6.7 4.35v6.5l-6.7-4.35v-6.5zm8.7 10.85v-6.5l6.7-4.35v6.5l-6.7 4.35z" />
            </svg>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-xl text-neutral-900 tracking-tight lowercase">
              veritas
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono px-1 py-0.5 bg-neutral-100 rounded">
              AI
            </span>
          </div>
        </div>

        {/* CENTER PILL SWITCHER */}
        <nav className="hidden md:flex items-center bg-neutral-100 p-1 rounded-full border border-black/5 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-white px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 px-3 py-1.5 text-xs sm:text-sm font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: Showstopper [SIMULATE RED SEA BLOCKADE] + Search + Bell + Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* THE SHOWSTOPPER ACTION BUTTON */}
          {onSimulateRedSea && (
            <button
              onClick={onSimulateRedSea}
              disabled={isProcessing}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] ${
                isDisrupted
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isDisrupted ? '[RED SEA COMPROMISED]' : '[⚡ SIMULATE RED SEA BLOCKADE]'}
              </span>
              <span className="sm:hidden">
                {isDisrupted ? 'Disrupted' : 'Simulate'}
              </span>
            </button>
          )}

          {/* Circular white embossed search button */}
          <button
            onClick={onOpenSearch}
            className="h-9 w-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-neutral-600 hover:text-neutral-900 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_#fff] hover:bg-neutral-50 transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Circular notification bell with a bright orange badge dot on top right */}
          <button
            className="relative h-9 w-9 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-neutral-600 hover:text-neutral-900 shadow-[0_2px_5px_rgba(0,0,0,0.04),inset_0_1px_0_#fff] hover:bg-neutral-50 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>

          {/* User Avatar with a 2px rainbow gradient ring */}
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold border border-white">
              DG
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
