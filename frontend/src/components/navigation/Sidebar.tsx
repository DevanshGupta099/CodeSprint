'use client';

import React from 'react';
import { 
  Network, 
  BarChart3, 
  AlertTriangle, 
  UploadCloud, 
  Layers, 
  ShieldCheck, 
  Database, 
  CheckCircle2,
  ChevronRight,
  Activity,
  Cpu
} from 'lucide-react';
import { Logo } from '../common/Logo';

export type DashboardView = 'graph' | 'analytics' | 'disruption' | 'ingestion';

interface SidebarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  activeTierFilter: number | null;
  onSelectTierFilter: (tier: number | null) => void;
  totalNodesCount: number;
  isDisrupted: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeTierFilter,
  onSelectTierFilter,
  totalNodesCount,
  isDisrupted,
}) => {
  const navItems: { id: DashboardView; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'graph',
      label: 'Supply Chain Network',
      icon: <Network className="w-4 h-4" />,
      badge: `${totalNodesCount} Nodes`,
    },
    {
      id: 'analytics',
      label: 'Risk & Spend Matrix',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'disruption',
      label: 'Disruption Sentinel',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: isDisrupted ? 'ALERT' : undefined,
    },
    {
      id: 'ingestion',
      label: 'BOM Data Pipeline',
      icon: <UploadCloud className="w-4 h-4" />,
    },
  ];

  const tierFilters = [
    { tier: null, label: 'All Tiers', count: totalNodesCount },
    { tier: 0, label: 'Tier 0 · Assembly', count: 1 },
    { tier: 1, label: 'Tier 1 · Subsystems', count: 2 },
    { tier: 2, label: 'Tier 2 · Components', count: 3 },
    { tier: 3, label: 'Tier 3 · Refined', count: 4 },
    { tier: 4, label: 'Tier 4 · Raw Materials', count: 2 },
  ];

  return (
    <aside className="w-64 h-full bg-[#090C14] border-r border-white/[0.08] flex flex-col justify-between select-none z-20 shrink-0 font-sans shadow-2xl">
      <div>
        {/* Brand Header with New Bespoke Logo */}
        <div className="h-16 px-5 border-b border-white/[0.08] flex items-center bg-[#07090F]/80">
          <Logo size="md" showText={true} />
        </div>

        {/* Primary View Navigation */}
        <div className="p-3">
          <span className="px-3 text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-2">
            Intelligence Views
          </span>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-950/40'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-indigo-400' : 'text-zinc-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.badge === 'ALERT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tier Depth Hierarchy Filter */}
        <div className="px-3 pt-2">
          <span className="px-3 text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-2">
            Tier Depth Filter
          </span>
          <div className="flex flex-col gap-1">
            {tierFilters.map((tf) => {
              const isSelected = activeTierFilter === tf.tier;
              return (
                <button
                  key={tf.label}
                  onClick={() => onSelectTierFilter(isSelected && tf.tier !== null ? null : tf.tier)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/[0.08] text-white font-bold border border-white/[0.08]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="truncate">{tf.label}</span>
                  <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                    {tf.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Telemetry Card */}
      <div className="p-4 m-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-indigo-400" />
            <span>PostgreSQL CTE</span>
          </span>
          <span className="text-emerald-400 font-semibold font-mono">0.7x Decay</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SDG 8 & 12 Audit</span>
          </span>
          <span className="text-zinc-300 font-mono">98.4% Compliant</span>
        </div>
      </div>
    </aside>
  );
};
