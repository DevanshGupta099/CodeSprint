'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Zap, 
  RotateCcw, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Leaf, 
  ExternalLink,
  ChevronRight,
  Filter,
  User
} from 'lucide-react';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { Supplier } from '../../types/supply-chain';
import { ThemeToggle } from '../common/ThemeToggle';

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
  onSelectSupplierFromSearch?: (supplier: Supplier) => void;
  isDisrupted?: boolean;
  isProcessing?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onSimulateRedSea,
  onSelectSupplierFromSearch,
  isDisrupted = false,
  isProcessing = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const tabs: { id: ZentraTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'graph', label: 'Supply Graph' },
    { id: 'suppliers', label: 'Suppliers', badge: '14' },
    { id: 'disruptions', label: 'Disruptions', badge: isDisrupted ? 'ALERT' : undefined },
    { id: 'sanctions', label: 'Sanctions Watch' },
    { id: 'esg', label: 'ESG Metrics' },
    { id: 'reports', label: 'Reports' },
  ];

  // Filtered suppliers for the search modal
  const filteredSuppliers = INITIAL_DAG_DATA.nodes.filter(n => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      n.name.toLowerCase().includes(q) ||
      n.code.toLowerCase().includes(q) ||
      n.country.toLowerCase().includes(q) ||
      n.materialCategory.toLowerCase().includes(q) ||
      `tier ${n.tier}`.includes(q)
    );
  });

  const notifications = [
    {
      id: 1,
      type: 'critical',
      title: 'Bab-el-Mandeb Security Blockade',
      desc: 'Apex Maritime Logistics compromised (0.94 severity). 0.7x CTE risk wave active.',
      time: '2m ago',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 2,
      type: 'success',
      title: 'Autonomous Reroute Ready',
      desc: 'Nordic Horn Maritime Lines pre-qualified. Scope-3 avoided: +1,420 tCO2e.',
      time: '8m ago',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 3,
      type: 'info',
      title: 'UFLPA Section 307 Sanctions Clearance',
      desc: 'Recursive check completed across 14 Tier-1 to Tier-4 entities.',
      time: '24m ago',
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />,
    },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 select-none font-sans relative z-30">
      {/* Outer Container: Rounded pill nav bar floating at top with subtle border */}
      <header className="w-full bg-white/95 dark:bg-[#0B0F19]/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 rounded-full border border-black/[0.05] dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2 sm:gap-3 transition-colors duration-300">
        {/* LEFT: Amber square emblem + bold lowercase veritas brand logo */}
        <div 
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer" 
          onClick={() => {
            onSelectTab('overview');
            setIsMobileMenuOpen(false);
          }}
        >
          {/* Amber Square Emblem */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" stroke="none">
              <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zm0 3.3l6.7 4.35L12 14 5.3 9.65 12 5.3zm-7.7 6.25l6.7 4.35v6.5l-6.7-4.35v-6.5zm8.7 10.85v-6.5l6.7-4.35v6.5l-6.7 4.35z" />
            </svg>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl text-neutral-900 dark:text-white tracking-tight lowercase">
              veritas
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-slate-400 font-mono px-1 py-0.5 bg-neutral-100 dark:bg-slate-800 rounded">
              AI
            </span>
          </div>
        </div>

        {/* CENTER PILL SWITCHER (DESKTOP) */}
        <nav className="hidden lg:flex items-center bg-neutral-100 dark:bg-slate-900/90 p-1 rounded-full border border-black/5 dark:border-white/10 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#18181B] dark:bg-white text-white dark:text-slate-950 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-sm'
                    : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 text-xs font-medium'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    isActive 
                      ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-900' 
                      : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT CONTROLS: [SIMULATE] + ThemeToggle + Search + Bell + Avatar + Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* THE SHOWSTOPPER ACTION BUTTON */}
          {onSimulateRedSea && (
            <button
              onClick={onSimulateRedSea}
              disabled={isProcessing}
              className={`px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] ${
                isDisrupted
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-950 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200 dark:shadow-amber-950'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isDisrupted ? '[RED SEA COMPROMISED]' : '[SIMULATE RED SEA BLOCKADE]'}
              </span>
              <span className="sm:hidden text-[10px]">
                {isDisrupted ? 'Disrupted' : 'Simulate'}
              </span>
            </button>
          )}

          {/* THEME TOGGLE (DARK / LIGHT WITH VIEW TRANSITION ANIMATION) */}
          <ThemeToggle />

          {/* Search Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] hover:bg-neutral-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Search Suppliers & Tiers"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Notification Bell with Popover */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => setIsNotifsOpen(!isNotifsOpen)}
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] hover:bg-neutral-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {isNotifsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0B0F19] border border-black/[0.08] dark:border-white/10 shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">Autonomous Telemetry Alerts</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 font-bold">LIVE</span>
                  </div>
                  <button 
                    onClick={() => setIsNotifsOpen(false)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className="p-2.5 rounded-xl bg-neutral-50 dark:bg-slate-900/80 hover:bg-neutral-100/80 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 cursor-pointer border border-black/[0.03] dark:border-white/5"
                      onClick={() => {
                        if (n.id === 1 && onSimulateRedSea) onSimulateRedSea();
                        setIsNotifsOpen(false);
                      }}
                    >
                      <div className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-black/[0.04] dark:border-white/10 shadow-xs mt-0.5">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-neutral-900 dark:text-slate-100 text-xs truncate">{n.title}</span>
                          <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-500 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-sm cursor-pointer hover:scale-105 transition-transform"
              title="Organization Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 dark:bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-white dark:border-slate-700">
                DG
              </div>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0B0F19] border border-black/[0.08] dark:border-white/10 shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06] dark:border-white/10 mb-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                    DG
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Sundar & Devansh</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-slate-400 font-mono">Veritas Motors Corp</p>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-slate-300 space-y-1.5 pb-3 border-b border-black/[0.06] dark:border-white/10 mb-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 dark:text-slate-500">Org UUID:</span>
                    <span className="font-bold text-neutral-800 dark:text-slate-200 truncate max-w-[120px]">00000000...0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 dark:text-slate-500">CTE Engine:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">PostgreSQL (0.7x)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 dark:text-slate-500">AI Sentinel:</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">Gemini & Groq</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full py-1.5 rounded-xl bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON (< lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-neutral-100 dark:bg-slate-800 border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-slate-200 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl rounded-3xl border border-black/[0.06] dark:border-white/10 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-[#18181B] dark:bg-white text-white dark:text-slate-950 shadow-xs'
                      : 'bg-neutral-50 dark:bg-slate-900 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-slate-200 border border-black/[0.03] dark:border-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      isActive 
                        ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-900' 
                        : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-slate-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Theme Toggle Row */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between px-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-slate-300">Theme Mode</span>
            <ThemeToggle showLabel />
          </div>
        </div>
      )}

      {/* INTERACTIVE FAST SEARCH MODAL */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 font-sans">
          <div 
            className="absolute inset-0 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSearchModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0B0F19] rounded-3xl p-5 shadow-2xl border border-black/[0.08] dark:border-white/10 z-10 max-h-[75vh] flex flex-col text-neutral-900 dark:text-slate-100">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-white/10">
              <Search className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 14 suppliers by name, code, material, or tier (e.g. Chile, Inverters, Tier 2)..."
                className="flex-1 text-xs sm:text-sm font-medium outline-none text-neutral-800 dark:text-slate-100 placeholder:text-neutral-400 dark:placeholder:text-slate-500 bg-transparent"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-1.5">
              {filteredSuppliers.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 dark:text-slate-500">
                  No suppliers match &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredSuppliers.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (onSelectSupplierFromSearch) {
                        onSelectSupplierFromSearch(s);
                      } else {
                        onSelectTab('graph');
                      }
                      setIsSearchModalOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-slate-900/80 border border-transparent hover:border-black/[0.05] dark:hover:border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900 dark:text-slate-100 group-hover:text-amber-500 dark:group-hover:text-cyan-400 transition-colors">
                          {s.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300">
                          Tier {s.tier}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-500">{s.code}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-slate-400 mt-0.5">
                        {s.materialCategory} • {s.country} • ${s.spend}M Spend
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        s.status === 'CRITICAL' 
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900' 
                          : s.status === 'ELEVATED'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      }`}>
                        {s.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
