'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { PortfolioBreakdownResponse } from '../../types/supply-chain';
import { X, Globe2, Layers, Award } from 'lucide-react';

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
      <div className="relative w-full max-w-4xl zero-card rounded-2xl p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] font-mono max-h-[92vh] overflow-y-auto border-cyan-500/30">
        {/* Top Specular Micro-Bevel */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase hud-shimmer-text">
              [ANALYTICS_MODULE // TIER-N PORTFOLIO EXPOSURE]
            </span>
            <h2 className="font-display font-black text-lg sm:text-2xl text-white tracking-tight uppercase">
              Supply Chain Risk Intelligence
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full border border-white/10 hover:border-cyan-400/60 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer z-10 shrink-0"
            aria-label="Close Analytics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Chart 1: Spend at Risk by Geography */}
          <div className="p-4 bg-slate-950/80 border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold">
              <Globe2 className="w-4 h-4" />
              <span>SPEND AT RISK BY GEOGRAPHY ($M)</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData}>
                  <XAxis
                    dataKey="country"
                    stroke="#64748B"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      borderColor: 'rgba(255,255,255,0.2)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="totalSpend" fill="#00F0FF" opacity={0.6} name="Total Spend ($M)" />
                  <Bar dataKey="atRiskSpend" fill="#FF2E54" name="At-Risk Spend ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Spend by Tier */}
          <div className="p-4 bg-slate-950/80 border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold">
              <Layers className="w-4 h-4" />
              <span>EXPOSURE BY TIER DEPTH</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierChartData} layout="vertical">
                  <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="tier"
                    stroke="#64748B"
                    fontSize={10}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      borderColor: 'rgba(255,255,255,0.2)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="spend" fill="#00F0FF" name="Total Spend ($M)" />
                  <Bar dataKey="atRisk" fill="#FFB800" name="At Risk ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ESG & SDG Anchors */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>UN SUSTAINABLE DEVELOPMENT GOAL (SDG) ANCHORS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400">SDG 8: DECENT WORK</div>
              <div className="font-bold text-white text-sm mt-1">
                {data.esgCompliance.laborStandardsCertifiedCount} / {data.esgCompliance.totalSuppliers} Nodes
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">RMI & ILO compliant</div>
            </div>
            <div className="p-3 bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400">SDG 12: RESPONSIBLE PROD.</div>
              <div className="font-bold text-white text-sm mt-1">
                {data.esgCompliance.environmentalCertifiedCount} / {data.esgCompliance.totalSuppliers} Nodes
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">ISO 14001 / IRMA verified</div>
            </div>
            <div className="p-3 bg-black/40 border border-white/5">
              <div className="text-[10px] text-slate-400">PORTFOLIO COMPLIANCE</div>
              <div className="font-bold text-emerald-400 text-sm mt-1">
                {data.esgCompliance.compliancePercentage}%
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Verified ESG coverage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
