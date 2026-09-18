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
  User,
  Database,
  ChevronDown,
  Upload
} from 'lucide-react';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { BOM_PRESETS_CATALOG } from '../../data/bom-presets';
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
  activeBOMKey?: string;
  onSelectBOM?: (presetKey: string) => void;
  onOpenIngest?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = React.memo(({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onSimulateRedSea,
  onSelectSupplierFromSearch,
  isDisrupted = false,
  isProcessing = false,
  activeBOMKey = 'EV_BATTERY_PACK',
  onSelectBOM,
  onOpenIngest,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBomDropdownOpen, setIsBomDropdownOpen] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const bomDropdownRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (bomDropdownRef.current && !bomDropdownRef.current.contains(e.target as Node)) {
        setIsBomDropdownOpen(false);
      }
      if (headerContainerRef.current && !headerContainerRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentBOMInfo = BOM_PRESETS_CATALOG[activeBOMKey] || BOM_PRESETS_CATALOG.EV_BATTERY_PACK;

  const simulateLabel = isDisrupted
    ? activeBOMKey === 'AEROSPACE_SATELLITE'
      ? '[MALACCA ALERT]'
      : activeBOMKey === 'SEMICONDUCTOR_MCU'
      ? '[BLACK SEA ALERT]'
      : activeBOMKey.startsWith('CUSTOM')
      ? '[CHOKEPOINT ALERT]'
      : '[RED SEA ALERT]'
    : activeBOMKey === 'AEROSPACE_SATELLITE'
    ? 'SIMULATE MALACCA'
    : activeBOMKey === 'SEMICONDUCTOR_MCU'
    ? 'SIMULATE BLACK SEA'
    : activeBOMKey.startsWith('CUSTOM')
    ? 'SIMULATE CHOKEPOINT'
    : 'SIMULATE RED SEA';

  const simulateShortLabel = isDisrupted ? 'ALERT' : 'SIMULATE';

  const tabs: { id: ZentraTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'graph', label: 'Graph' },
    { id: 'suppliers', label: 'Suppliers', badge: String(INITIAL_DAG_DATA.nodes.length) },
    { id: 'disruptions', label: 'Disruptions', badge: isDisrupted ? 'ALERT' : undefined },
    { id: 'sanctions', label: 'Sanctions' },
    { id: 'esg', label: 'ESG' },
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
    <div ref={headerContainerRef} className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 pt-3 sm:pt-6 font-sans relative z-30">
      {/* Outer Container: Rounded pill nav bar floating at top with subtle border */}
      <header className="w-full min-w-0 bg-white/95 dark:bg-[#0B0F19]/90 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-black/[0.05] dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.5)] flex items-center justify-between gap-1.5 sm:gap-2 transition-colors duration-300">
        {/* LEFT: Amber square emblem + bold lowercase veritas brand logo + [ACTIVE_BOM] (on tablet/desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          <div
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer"
            onClick={() => {
              onSelectTab('overview');
              setIsMobileMenuOpen(false);
            }}
          >
            {/* Amber Square Emblem */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" stroke="none">
                <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zm0 3.3l6.7 4.35L12 14 5.3 9.65 12 5.3zm-7.7 6.25l6.7 4.35v6.5l-6.7-4.35v-6.5zm8.7 10.85v-6.5l6.7-4.35v6.5l-6.7 4.35z" />
              </svg>
            </div>

            <div className="flex items-baseline gap-1 shrink-0">
              <span className="font-extrabold text-base sm:text-xl text-neutral-900 dark:text-white tracking-tight lowercase">
                veritas
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-slate-300 font-mono px-1 py-0.5 bg-neutral-200/80 dark:bg-slate-800 rounded">
                AI
              </span>
            </div>
          </div>

          {/* ACTIVE BOM DROPDOWN BADGE (Only on tablet/desktop to save mobile space) */}
          <div className="relative shrink-0 hidden sm:block" ref={bomDropdownRef}>
            <button
              onClick={() => setIsBomDropdownOpen(!isBomDropdownOpen)}
              className="px-2 sm:px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-neutral-800 dark:text-slate-200 border border-black/[0.06] dark:border-white/10 text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Switch Active Bill of Materials (BOM) Architecture"
              aria-label={`BOM: ${currentBOMInfo?.badge || activeBOMKey}, switch active architecture`}
              aria-haspopup="true"
              aria-expanded={isBomDropdownOpen}
            >
              <Database className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="hidden xl:inline text-neutral-600 dark:text-slate-400 font-medium">BOM:</span>
              <span className="truncate max-w-[90px] sm:max-w-[130px] text-neutral-900 dark:text-white">
                {currentBOMInfo?.badge || activeBOMKey}
              </span>
              <ChevronDown className={`w-3 h-3 text-neutral-500 dark:text-slate-400 transition-transform ${isBomDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBomDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0B0F19] border border-black/[0.08] dark:border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                <div className="px-2.5 py-1.5 mb-1 border-b border-black/[0.06] dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-400 dark:text-slate-400">
                    SELECT ACTIVE BOM
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                    3 PRESETS
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {Object.values(BOM_PRESETS_CATALOG).map((preset) => {
                    const isSelected = activeBOMKey === preset.key;
                    return (
                      <button
                        key={preset.key}
                        onClick={() => {
                          if (onSelectBOM) onSelectBOM(preset.key);
                          setIsBomDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 border ${isSelected
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 border-neutral-900 dark:border-white shadow-xs'
                          : 'hover:bg-neutral-100 dark:hover:bg-slate-800/80 text-neutral-800 dark:text-slate-200 border-transparent'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${isSelected
                            ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950'
                            : 'bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300'
                            }`}>
                            {preset.badge}
                          </span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-white/70 dark:text-slate-950/70' : 'text-neutral-400 dark:text-slate-500'}`}>
                            {preset.nodeCount} nodes
                          </span>
                        </div>
                        <span className="font-bold text-xs leading-snug">
                          {preset.title}
                        </span>
                        <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-white/80 dark:text-slate-950/80' : 'text-neutral-500 dark:text-slate-400'}`}>
                          {preset.primaryChokepoint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Action: Ingest Custom BOM or PDF */}
                <div className="pt-2 mt-1.5 border-t border-black/[0.06] dark:border-white/10">
                  <button
                    onClick={() => {
                      setIsBomDropdownOpen(false);
                      if (onOpenIngest) onOpenIngest();
                    }}
                    className="w-full p-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Upload Custom BOM / PDF</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase">
                      AI INGEST
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PILL SWITCHER (DESKTOP): dynamically scales between 1024px and 1440px */}
        <nav className="hidden lg:flex items-center bg-neutral-100 dark:bg-slate-900/90 p-0.5 xl:p-1 rounded-full border border-black/5 dark:border-white/10 shadow-inner shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-all duration-200 cursor-pointer flex items-center gap-1 xl:gap-1.5 shrink-0 ${isActive
                  ? 'bg-[#18181B] dark:bg-white text-white dark:text-slate-950 px-2.5 xl:px-3.5 py-1 xl:py-1.5 rounded-full font-semibold text-[11px] xl:text-xs shadow-sm'
                  : 'text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white px-2 xl:px-3 py-1 xl:py-1.5 text-[11px] xl:text-xs font-medium'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${isActive
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
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] shrink-0 ${isDisrupted
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-950 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200 dark:shadow-amber-950'
                }`}
            >
              <Zap className={`w-3.5 h-3.5 shrink-0 ${isProcessing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-mono">
                {simulateLabel}
              </span>
              <span className="md:hidden font-mono text-[11px]">
                {simulateShortLabel}
              </span>
            </button>
          )}

          {/* THEME TOGGLE (DARK / LIGHT WITH VIEW TRANSITION ANIMATION) */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Search Button (Visible on sm screens and up, also present in mobile menu) */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            aria-label="Search Suppliers & Tiers"
            className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.06] dark:border-white/10 items-center justify-center text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] hover:bg-neutral-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Search Suppliers & Tiers"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Notification Bell with Popover (Visible on sm screens and up) */}
          <div className="relative shrink-0 hidden sm:block" ref={notifsRef}>
            <button
              onClick={() => setIsNotifsOpen(!isNotifsOpen)}
              aria-label="Notifications"
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
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="SD, Organization Profile"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-sm cursor-pointer hover:scale-105 transition-transform block"
              title="Organization Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 dark:bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-white dark:border-slate-700">
                SD
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0B0F19] border border-black/[0.08] dark:border-white/10 shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06] dark:border-white/10 mb-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                    SD
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
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-neutral-100 dark:bg-slate-800 border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-slate-200 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3.5 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl rounded-3xl border border-black/[0.06] dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
            {/* User Profile Header on Mobile */}
            <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-neutral-900 dark:bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                    SD
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs">Sundar & Devansh</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-slate-400 font-mono">Veritas Motors Corp</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                CTE ONLINE
              </span>
            </div>

            {/* Quick Mobile Search Trigger */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchModalOpen(true);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-slate-800/80 hover:bg-neutral-200 dark:hover:bg-slate-700/80 text-neutral-600 dark:text-slate-300 text-xs font-medium flex items-center justify-between transition-colors border border-black/[0.04] dark:border-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span>Search suppliers, materials, tiers...</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-black/[0.06] dark:border-white/10 text-neutral-400">
                ⌘K
              </span>
            </button>

            {/* Navigation Tabs Grid: 7 core tabs + 1 quick action for custom BOM ingestion */}
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
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${isActive
                      ? 'bg-[#18181B] dark:bg-white text-white dark:text-slate-950 shadow-xs'
                      : 'bg-neutral-50 dark:bg-slate-900 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-slate-200 border border-black/[0.03] dark:border-white/5'
                      }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${isActive
                        ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-900'
                        : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-slate-300'
                        }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenIngest) onOpenIngest();
                }}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload BOM</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  AI
                </span>
              </button>
            </div>

            {/* Mobile Active BOM Switcher Row */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 px-1">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 dark:text-slate-500">
                  ACTIVE BOM ARCHITECTURE
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  {currentBOMInfo?.badge}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {Object.values(BOM_PRESETS_CATALOG).map((preset) => {
                  const isSelected = activeBOMKey === preset.key;
                  return (
                    <button
                      key={preset.key}
                      onClick={() => {
                        if (onSelectBOM) onSelectBOM(preset.key);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all border cursor-pointer ${isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 border-neutral-900 dark:border-white'
                        : 'bg-neutral-50 dark:bg-slate-900 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-slate-200 border-black/[0.04] dark:border-white/5'
                        }`}
                    >
                      <span>{preset.shortTitle}</span>
                      <span className="text-[10px] font-mono opacity-80">{preset.nodeCount} nodes</span>
                    </button>
                  );
                })}
              </div>
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
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${s.status === 'CRITICAL'
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
});

GlobalHeader.displayName = 'GlobalHeader';

