'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PortfolioBreakdownResponse } from '../../types/supply-chain';
import { X, Globe2, Layers, Award, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#070D14]/98 border border-white/20 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.95)] font-mono max-h-[92vh] overflow-y-auto crosshair-corner">
        {/* Corner crosshairs */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div>
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase font-bold">
              [EXECUTIVE_ANALYTICS // TIER-N EXPOSURE AUDIT]
            </span>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
              Supply Chain Risk Intelligence
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-white/10 hover:border-cyan-400 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Chart 1: Spend at Risk by Geography */}
          <div className="p-4 bg-black/50 border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-4 h-4" />
              <span>Spend Exposure by Geography ($M)</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData}>
                  <XAxis dataKey="country" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070D14',
                      borderColor: 'rgba(255,255,255,0.2)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="totalSpend" fill="#00F0FF" opacity={0.5} name="Total Spend ($M)" />
                  <Bar dataKey="atRiskSpend" fill="#FF2E54" name="At-Risk Spend ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Spend & Risk by Tier */}
          <div className="p-4 bg-black/50 border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Tier-N Depth Risk Breakdown ($M)</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierChartData}>
                  <XAxis dataKey="tier" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070D14',
                      borderColor: 'rgba(255,255,255,0.2)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="spend" fill="#3B82F6" opacity={0.6} name="Total Tier Spend ($M)" />
                  <Bar dataKey="atRisk" fill="#FFB800" name="At-Risk Spend ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ESG SDG-8 & SDG-12 Compliance Banner */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-sm text-white uppercase block">
                ESG & Forced Labor Audit (SDG 8 & 12)
              </span>
              <span className="text-xs text-emerald-300">
                {data.esgCompliance.compliancePercentage}% Compliance Index · {data.esgCompliance.certifiedSuppliersCount}/{data.esgCompliance.totalSuppliers} Certified Nodes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">SDG 8 DECENT WORK</span>
              <span className="text-emerald-400">{data.esgCompliance.laborStandardsCertifiedCount} Nodes Passed</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">SDG 12 CARBON AUDIT</span>
              <span className="text-emerald-400">{data.esgCompliance.environmentalCertifiedCount} Nodes Audited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
