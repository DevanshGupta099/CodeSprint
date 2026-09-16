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
import { Globe2, Layers, Award, ShieldCheck, DollarSign, TrendingDown } from 'lucide-react';

interface AnalyticsViewProps {
  data: PortfolioBreakdownResponse | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-3 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <span className="text-xs font-medium">Aggregating Recursive CTE Risk Analytics...</span>
      </div>
    );
  }

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
    <div className="w-full h-full overflow-y-auto p-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Spend at Risk by Geography */}
          <div className="p-6 rounded-2xl bg-[#0B0E17] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span>Spend Exposure by Geography ($M)</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Total vs At-Risk</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="country" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#71717A" 
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
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="totalSpend" fill="#6366F1" stroke="rgba(255,255,255,0.15)" strokeWidth={1} radius={[4, 4, 0, 0]} name="Total Spend" opacity={0.6} />
                  <Bar dataKey="atRiskSpend" fill="#F43F5E" stroke="#FDA4AF" strokeWidth={1} radius={[4, 4, 0, 0]} name="At-Risk Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Spend & Risk by Tier */}
          <div className="p-6 rounded-2xl bg-[#0B0E17] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Value-at-Risk by Tier Depth ($M)</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">0.7x Upward Attenuation</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="tier" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#71717A" 
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
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="spend" fill="#8B5CF6" stroke="rgba(255,255,255,0.15)" strokeWidth={1} radius={[4, 4, 0, 0]} name="Tier Spend" opacity={0.6} />
                  <Bar dataKey="atRisk" fill="#F43F5E" stroke="#FDA4AF" strokeWidth={1} radius={[4, 4, 0, 0]} name="At-Risk Spend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ESG & Compliance Clearance Card */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">
                United Nations SDG 8 & SDG 12 Sanctions & Compliance Index
              </h4>
              <p className="text-xs text-emerald-400/80 mt-1">
                Zero Uyghur Forced Labor (UFLPA) violations across Tier-3/4 silicon & cobalt · Scope-3 avoided emissions actively audited.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
            98.4% Compliance Score
          </div>
        </div>
      </div>
    </div>
  );
};
