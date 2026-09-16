'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldAlert, 
  Globe2, 
  Network, 
  Building2, 
  Zap, 
  Leaf, 
  ArrowUpRight, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Download,
  FileText,
  Check,
  TrendingUp
} from 'lucide-react';
import { ZentraTab } from './GlobalHeader';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';
import { Supplier } from '../../types/supply-chain';

interface ZentraDetailModalProps {
  activeTab: ZentraTab;
  onClose: () => void;
  onTriggerDisruption?: (supplierId: string) => void;
  onSelectSupplier?: (supplier: Supplier) => void;
  onOpenAnalytics?: () => void;
}

export const ZentraDetailModal: React.FC<ZentraDetailModalProps> = ({
  activeTab,
  onClose,
  onTriggerDisruption,
  onSelectSupplier,
  onOpenAnalytics,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (activeTab === 'overview' || activeTab === 'graph') return null;

  const handleDownloadReport = (format: 'md' | 'csv') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    if (format === 'md') {
      filename = `VeritasSupply_Executive_Audit_${new Date().toISOString().slice(0, 10)}.md`;
      mimeType = 'text/markdown;charset=utf-8;';
      content = `# VERITAS SUPPLY CHAIN EXECUTIVE AUDIT & COMPLIANCE REPORT
Generated: ${new Date().toUTCString()}
Standard: UN SDG 8 (Forced Labor / Decent Work) & UN SDG 12 (Avoided Scope-3 Carbon)
Engine: PostgreSQL Recursive CTE (0.7x Upward Decay)

---

## 1. EXECUTIVE SUMMARY
- Monitored Tier-0 to Tier-4 Nodes: ${INITIAL_DAG_DATA.nodes.length}
- Screened Jurisdictions: Chile, DRC, China, Japan, Germany, USA, Yemen
- Cumulative Value-at-Risk: $41,540,000 USD
- Avoided Scope-3 Footprint: +1,420.5 tCO2e

---

## 2. TIER-N SUPPLIER ROSTER & PROVENANCE
${INITIAL_DAG_DATA.nodes.map(n => `### ${n.name} (${n.code})
- Tier: ${n.tier} | Country: ${n.country} (${n.countryCode})
- Material: ${n.materialCategory}
- Spend: $${n.spend}M USD | Lead Time: ${n.leadTimeDays} days
- Status: ${n.status} | CTE Risk Exposure: ${Math.round(n.riskScore * 100)}%
- SPOF Bottleneck: ${n.isSPOF ? 'YES (CRITICAL)' : 'NO'}
- Certifications: ${n.certifications.join(', ') || 'Standard Trade Protocol'}
`).join('\n')}

---

## 3. COMPLIANCE & SANCTIONS CLEARANCE
- UFLPA Section 307: Rebuttable presumption screening active on regional smelters.
- IMO Maritime Security: Bab-el-Mandeb bypass protocols validated.
- SEC / CSRD Scope-3 GHG Disclosure: Audited mass-balance custody chain verified.
`;
    } else {
      filename = `VeritasSupply_Suppliers_${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
      const headers = ['ID', 'Name', 'Code', 'Tier', 'Country', 'Category', 'Spend_M_USD', 'LeadTime_Days', 'Status', 'RiskScore', 'IsSPOF'];
      const rows = INITIAL_DAG_DATA.nodes.map(n => [
        n.id,
        `"${n.name}"`,
        n.code,
        n.tier,
        n.country,
        `"${n.materialCategory}"`,
        n.spend,
        n.leadTimeDays,
        n.status,
        n.riskScore,
        n.isSPOF ? 'TRUE' : 'FALSE'
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans select-none">
        {/* Soft Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-3xl rounded-[24px] sm:rounded-[32px] bg-white dark:bg-[#0B0F19] p-5 sm:p-8 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-black/[0.06] dark:border-white/10 max-h-[88vh] overflow-y-auto z-10 text-neutral-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300 font-mono">
                  {activeTab.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-400 dark:text-slate-400 font-medium">VeritasSupply Enterprise Intelligence</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {activeTab === 'suppliers' && 'Tier-N Multi-Tier Supplier Roster'}
                {activeTab === 'disruptions' && 'Multi-Tier Disruption & Shock Simulator'}
                {activeTab === 'sanctions' && 'UFLPA Sanctions & Forced Labor Sentinel'}
                {activeTab === 'esg' && 'Scope-3 Carbon & Environmental Compliance'}
                {activeTab === 'reports' && 'Executive Compliance & Audit Reports'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-400 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB CONTENT: TIER-N SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-neutral-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>14 mapped nodes across Tier-0 (Assembly) to Tier-4 (Mines & Maritime Choke Points)</span>
                <span className="text-[11px] font-mono text-neutral-400 dark:text-slate-500">Click any row to inspect</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {INITIAL_DAG_DATA.nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => {
                      if (onSelectSupplier) {
                        onSelectSupplier(node);
                        onClose();
                      }
                    }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100/90 dark:hover:bg-slate-800/80 border border-black/[0.04] dark:border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {node.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 border border-black/[0.06] dark:border-white/10">
                          Tier {node.tier}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-400">
                          {node.code}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
                        {node.materialCategory} • {node.country} ({node.countryCode}) • Lead Time: {node.leadTimeDays}d
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 dark:text-white block">
                        ${node.spend}M
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          node.status === 'CRITICAL'
                            ? 'text-rose-600 dark:text-rose-400'
                            : node.status === 'ELEVATED'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: SANCTIONS WATCH */}
          {activeTab === 'sanctions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/40 text-xs text-rose-900 dark:text-rose-200 leading-relaxed flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-1">
                    UFLPA Section 307 & Countering America&apos;s Adversaries (CAATSA) Active Watch
                  </span>
                  Continuous screening against entity lists, forced labor rebuttable presumptions, and regional polysilicon smelters.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10">
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block mb-1">
                    Screened Suppliers
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">14 / 14</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">100% Provenance Coverage</span>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10">
                  <span className="text-[11px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block mb-1">
                    Clearance Latency
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-white">0.42s</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-1">Real-time Recursive CTE</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 dark:bg-black/60 dark:border dark:border-white/10 text-white text-xs">
                <h4 className="font-bold font-mono text-sky-400 uppercase text-[11px] mb-1">
                  High-Scrutiny Entity: Xinjiang PureSilicon Ltd (XPS-CHN)
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  Tier-3 smelting node flagged for regional coal-grid dependency and strict export presumption. Pre-qualified Nordic failover ready.
                </p>
                <button
                  onClick={() => {
                    if (onTriggerDisruption) onTriggerDisruption('10000000-0000-0000-0000-000000000006');
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate UFLPA Sanction Shock</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ESG METRICS */}
          {activeTab === 'esg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-1">
                    UN SDG 12 (Responsible Production) & Scope-3 Carbon Sentinel
                  </span>
                  Real-time GHG Protocol Corporate Value Chain calculation across maritime carriers, smelters, and mining concessions.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-slate-400 block">Avoided Scope-3</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">+1,420 tCO2e</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-slate-400 block">ISO 14001 Rate</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 block">92.8%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-slate-400 block">Dual-Fuel Fleet</span>
                  <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1 block">78.5%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.04] dark:border-white/10 text-xs space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white">Maritime Emission Reduction Protocol</h4>
                <p className="text-neutral-600 dark:text-slate-300 leading-relaxed">
                  Autonomous reroutes prioritize dual-fuel carriers utilizing green methanol and low-sulfur heavy fuel oil (VLSFO), reducing voyage-average GHG intensity by 24.3%.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: DISRUPTIONS */}
          {activeTab === 'disruptions' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 dark:text-slate-300 leading-relaxed">
                Trigger upstream supply shocks to execute recursive 0.7x attenuation CTE risk waves and view autonomous mitigation rerouting.
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100/80 dark:hover:bg-slate-800/80 border border-black/[0.04] dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm block">
                      Bab-el-Mandeb Strait Maritime Blockade
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">
                      Apex Maritime Logistics (AML-YEM) • Risk: 0.94 • Split Reroute to Vietnam & Mexico
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onTriggerDisruption) onTriggerDisruption('10000000-0000-0000-0000-000000000007');
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    Simulate
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100/80 dark:hover:bg-slate-800/80 border border-black/[0.04] dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm block">
                      Taiwan Strait Semiconductor Halt
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">
                      DriveTech Inverters (DTI-JPN/TWN) • Risk: 0.88 • Dual Sourcing Failover
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onTriggerDisruption) onTriggerDisruption('10000000-0000-0000-0000-000000000004');
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    Simulate
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100/80 dark:hover:bg-slate-800/80 border border-black/[0.04] dark:border-white/10 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm block">
                      Xinjiang Polysilicon Smelter UFLPA Embargo
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-slate-400">
                      Xinjiang PureSilicon Ltd (XPS-CHN) • Risk: 0.96 • Rebuttable Presumption
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onTriggerDisruption) onTriggerDisruption('10000000-0000-0000-0000-000000000006');
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-3">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-1">
                    Automated Tier-N Provenance & ESG Audit Reports
                  </span>
                  Ready for download in Markdown (with CTE risk traces) or CSV tabular format for enterprise ERP integration.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 30-Day Historical Risk Progression Launcher */}
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAnalytics) onOpenAnalytics();
                  }}
                  className="col-span-1 sm:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-rose-900/20 hover:from-blue-900/50 hover:to-rose-900/40 border border-blue-500/30 text-left transition-all group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-neutral-900 dark:text-white text-sm">
                          Executive Risk Audit & 30-Day Historical Progression
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          RECHARTS AREA
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
                        Interactive Recharts visualizer tracking baseline $12M to disrupted $41.5M exposure at Day 26 Bab-el-Mandeb crisis onset.
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-neutral-900 dark:bg-white text-white dark:text-slate-950 group-hover:scale-105 transition-transform shrink-0">
                    VIEW CHARTS &rarr;
                  </span>
                </button>

                <button
                  onClick={() => handleDownloadReport('md')}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100 dark:hover:bg-slate-800 border border-black/[0.06] dark:border-white/10 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase">Audit Dossier</span>
                    <Download className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Executive Audit Report (.MD)</h4>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
                    Full multi-tier breakdown including recursive CTE propagation matrices, SDG 8 and SDG 12 compliance.
                  </p>
                </button>

                <button
                  onClick={() => handleDownloadReport('csv')}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 hover:bg-neutral-100 dark:hover:bg-slate-800 border border-black/[0.06] dark:border-white/10 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase">Tabular Raw Data</span>
                    <Download className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Supplier Roster (.CSV)</h4>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 leading-relaxed">
                    14 monitored supplier nodes with spend, lead times, risk scores, and SPOF flags for spreadsheet tools.
                  </p>
                </button>
              </div>

              {downloadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Report successfully generated and downloaded!</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
