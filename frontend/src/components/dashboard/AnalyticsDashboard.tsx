'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { PortfolioBreakdownResponse } from '../../types/supply-chain';
import { X, Globe2, Layers, Award, ShieldCheck, DollarSign } from 'lucide-react';

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
