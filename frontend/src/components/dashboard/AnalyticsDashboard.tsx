'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { PortfolioBreakdownResponse } from '../../types/supply-chain';
import { X, Globe2, Layers, Award, ShieldCheck, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  data: PortfolioBreakdownResponse | null;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  const countryChartData = data.byCountry.map((c) => ({
    country: c.countryCode || c.country.substring(0, 3).toUpperCase(),
    totalSpend: c.spendUSD,
    atRiskSpend: c.atRiskSpendUSD,
    status: c.status,
  }));

  const tierChartData = data.byTier.map((t) => ({
    tier: t.tierLabel,
    spend: t.spendUSD,
    atRisk: t.atRiskSpendUSD,
  }));

  // 30-Day Historical Risk Progression Data (Day 1-25: baseline ~$12M, Day 26: spike to $34.2M, Day 30: $41.5M)
  const historicalTimelineData = [
    { day: 'D01', dayNumber: 1, label: 'Day 1', riskM: 11.8, baseline: 12.0, status: 'NOMINAL', note: 'Standard Operations' },
    { day: 'D03', dayNumber: 3, label: 'Day 3', riskM: 12.1, baseline: 12.0, status: 'NOMINAL', note: 'Routine Baltic Transit' },
    { day: 'D05', dayNumber: 5, label: 'Day 5', riskM: 11.9, baseline: 12.0, status: 'NOMINAL', note: 'Nominal Port Throughput' },
    { day: 'D07', dayNumber: 7, label: 'Day 7', riskM: 12.3, baseline: 12.0, status: 'NOMINAL', note: 'Taiwan Foundry Dispatch' },
    { day: 'D09', dayNumber: 9, label: 'Day 9', riskM: 12.0, baseline: 12.0, status: 'NOMINAL', note: 'Rotterdam Customs Cleared' },
    { day: 'D11', dayNumber: 11, label: 'Day 11', riskM: 12.2, baseline: 12.0, status: 'NOMINAL', note: 'Chile Lithium Brine Nominal' },
    { day: 'D13', dayNumber: 13, label: 'Day 13', riskM: 11.7, baseline: 12.0, status: 'NOMINAL', note: 'DRC Audited Corridor' },
    { day: 'D15', dayNumber: 15, label: 'Day 15', riskM: 12.0, baseline: 12.0, status: 'NOMINAL', note: 'German Battery Module Splicing' },
    { day: 'D17', dayNumber: 17, label: 'Day 17', riskM: 12.4, baseline: 12.0, status: 'NOMINAL', note: 'Suez Maritime Normal Transit' },
    { day: 'D19', dayNumber: 19, label: 'Day 19', riskM: 12.1, baseline: 12.0, status: 'NOMINAL', note: 'Air Freight Corridors Nominal' },
    { day: 'D21', dayNumber: 21, label: 'Day 21', riskM: 12.5, baseline: 12.0, status: 'NOMINAL', note: 'Tier-3 Smelter Buffer Intact' },
    { day: 'D23', dayNumber: 23, label: 'Day 23', riskM: 12.2, baseline: 12.0, status: 'NOMINAL', note: 'Red Sea Security Advisory Level 1' },
    { day: 'D25', dayNumber: 25, label: 'Day 25', riskM: 12.8, baseline: 12.0, status: 'ELEVATED', note: 'Bab-el-Mandeb Tension Escalating' },
    { day: 'D26', dayNumber: 26, label: 'Day 26', riskM: 34.2, baseline: 12.0, status: 'CRITICAL', note: 'CHOKEPOINT ATTACK // BAB-EL-MANDEB' },
    { day: 'D27', dayNumber: 27, label: 'Day 27', riskM: 37.8, baseline: 12.0, status: 'CRITICAL', note: '0.7x CTE Propagation to Tier-2 Cells' },
    { day: 'D28', dayNumber: 28, label: 'Day 28', riskM: 39.9, baseline: 12.0, status: 'CRITICAL', note: 'Tier-1 Subsystem Integration Cascade' },
    { day: 'D29', dayNumber: 29, label: 'Day 29', riskM: 41.2, baseline: 12.0, status: 'CRITICAL', note: 'Full Enterprise OEM Exposure' },
    { day: 'D30', dayNumber: 30, label: 'Day 30', riskM: 41.5, baseline: 12.0, status: 'CRITICAL', note: 'Peak Disruption // Autonomous Reroute Engaged' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0F1422]/98 border border-white/[0.12] p-6 shadow-2xl shadow-black/90 font-sans max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Executive Risk Audit
              </span>
              <span className="text-xs text-slate-400">Tier-N Value-at-Risk</span>
            </div>
            <h2 className="font-bold text-xl text-white tracking-tight">
              Portfolio Disruption & ESG Exposure
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Chart 1: Spend at Risk by Geography */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4 text-slate-200 text-xs font-semibold">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span>Spend Exposure by Geography ($M)</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="country" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false} 
                    width={48}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${value}M`, '']}
                    contentStyle={{
                      backgroundColor: '#0F1422',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                      color: '#F1F5F9',
                    }}
                  />
                  <Bar dataKey="totalSpend" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total Spend" opacity={0.6} />
                  <Bar dataKey="atRiskSpend" fill="#F43F5E" radius={[4, 4, 0, 0]} name="At-Risk Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Spend & Risk by Tier */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4 text-slate-200 text-xs font-semibold">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Value-at-Risk by Tier Depth ($M)</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="tier" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false} 
                    width={48}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${value}M`, '']}
                    contentStyle={{
                      backgroundColor: '#0F1422',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                      color: '#F1F5F9',
                    }}
                  />
                  <Bar dataKey="spend" fill="#6366F1" radius={[4, 4, 0, 0]} name="Tier Spend" opacity={0.6} />
                  <Bar dataKey="atRisk" fill="#F43F5E" radius={[4, 4, 0, 0]} name="At-Risk Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: 30-Day Historical Risk Progression (Full Width Recharts Area Chart) */}
          <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-black/30 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span>30-Day Historical Risk Progression (Bab-el-Mandeb Surge Event)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  CRISIS ONSET: DAY 26
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  $12.0M &rarr; $41.5M (+245%)
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalTimelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.65} />
                      <stop offset="65%" stopColor="#EA580C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false} 
                    width={48}
                    domain={[0, 48]}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      const isSpike = item.dayNumber >= 26;
                      return (
                        <div className="rounded-xl bg-[#0F1422] border border-white/10 p-3 shadow-xl font-sans text-xs min-w-[210px]">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                            <span className="font-mono font-bold text-white">{item.label}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isSpike ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-slate-400 text-[11px]">Spend at Risk:</span>
                            <span className={`font-mono font-bold text-sm ${isSpike ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ${item.riskM}M USD
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mb-1 text-[10px] text-slate-400">
                            <span>Baseline Target:</span>
                            <span className="font-mono">${item.baseline.toFixed(1)}M USD</span>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-1.5 pt-1.5 border-t border-white/5 font-mono leading-tight">
                            {item.note}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine 
                    x="D26" 
                    stroke="#F43F5E" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ 
                      value: 'Day 26 Attack', 
                      fill: '#FDA4AF', 
                      fontSize: 10, 
                      position: 'insideTopLeft' 
                    }} 
                  />
                  <ReferenceLine 
                    y={12.0} 
                    stroke="#10B981" 
                    strokeDasharray="2 2" 
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="riskM"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    fill="url(#riskAreaGradient)"
                    name="Risk Exposure ($M)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ESG & Sanctions Compliance Card */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                United Nations SDG 8 & 12 Compliance Index
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Forced Labor Prevention (UFLPA) active · Scope-3 Autonomous Tracking enabled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              98.4% Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
