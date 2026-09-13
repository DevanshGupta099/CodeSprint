'use client';

import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { ZentraTab } from './GlobalHeader';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';

interface ZentraDetailModalProps {
  activeTab: ZentraTab;
  onClose: () => void;
  onTriggerDisruption?: (supplierId: string) => void;
}

export const ZentraDetailModal: React.FC<ZentraDetailModalProps> = ({
  activeTab,
  onClose,
  onTriggerDisruption,
}) => {
  if (activeTab === 'overview' || activeTab === 'graph') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Soft Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-3xl rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl border border-black/[0.06] max-h-[88vh] overflow-y-auto zentra-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 font-mono">
                  {activeTab.toUpperCase()}
                </span>
                <span className="text-xs text-neutral-400">VeritasSupply Enterprise Intelligence</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                {activeTab === 'suppliers' && 'Tier-N Multi-Tier Supplier Roster'}
                {activeTab === 'disruptions' && 'Multi-Tier Disruption & Shock Simulator'}
                {activeTab === 'sanctions' && 'UFLPA Sanctions & Forced Labor Sentinel'}
                {activeTab === 'esg' && 'Scope-3 Carbon & Environmental Compliance'}
                {activeTab === 'reports' && 'Executive Compliance & Audit Reports'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB CONTENT: TIER-N SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-neutral-500 mb-2">
                14 mapped nodes across Tier-0 (Final Assembly) down to Tier-4 (Cobalt & Lithium Mines)
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {INITIAL_DAG_DATA.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100/80 border border-black/[0.04] transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                          {node.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-neutral-600 border border-black/[0.06]">
                          Tier {node.tier}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {node.code}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {node.materialCategory} • {node.country} ({node.countryCode}) • Lead Time: {node.leadTimeDays}d
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 block">
                        ${node.spend}M
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          node.status === 'CRITICAL'
                            ? 'text-rose-600'
                            : node.status === 'ELEVATED'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
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
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-900 leading-relaxed flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-1">
                    UFLPA Section 307 & Countering America&apos;s Adversaries (CAATSA) Active Watch
                  </span>
                  Continuous screening against entity lists, forced labor rebuttable presumptions, and regional polysilicon smelters.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase font-mono block mb-1">
                    Screened Suppliers
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-neutral-900">14 / 14</span>
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">100% Coverage</span>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase font-mono block mb-1">
                    Clearance Latency
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-neutral-900">0.42s</span>
                  <span className="text-xs text-blue-600 font-semibold block mt-1">Real-time CTE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ESG METRICS */}
          {activeTab === 'esg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-1">
                    UN SDG 12 (Responsible Production) & Scope-3 Carbon Sentinel
                  </span>
                  Real-time GHG Protocol Corporate Value Chain calculation across maritime carriers, smelters, and mining concessions.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Avoided Scope-3</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">+1,420 tCO2e</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">ISO 14001 Rate</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">92.8%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Dual-Fuel Fleet</span>
                  <span className="text-xl font-bold font-mono text-blue-700 mt-1 block">78.5%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: DISRUPTIONS & REPORTS */}
          {(activeTab === 'disruptions' || activeTab === 'reports') && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Trigger upstream supply shocks to execute recursive 0.7x attenuation CTE risk waves and view autonomous mitigation rerouting.
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-black/[0.04] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="font-bold text-neutral-900 text-xs sm:text-sm block">
                      Bab-el-Mandeb Strait Maritime Blockade
                    </span>
                    <span className="text-xs text-neutral-500">
                      Apex Maritime Logistics (AML-YEM) • Risk: 0.94 • Split Reroute to Vietnam & Mexico
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onTriggerDisruption) onTriggerDisruption('apex-maritime');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Simulate
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-black/[0.04] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <span className="font-bold text-neutral-900 text-xs sm:text-sm block">
                      Taiwan Strait Semiconductor Halt
                    </span>
                    <span className="text-xs text-neutral-500">
                      DriveTech Inverters (DTI-JPN/TWN) • Risk: 0.88 • Dual Sourcing Failover
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (onTriggerDisruption) onTriggerDisruption('drivetech-inverters');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
