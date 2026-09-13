'use client';

import React, { useState } from 'react';
import { Supplier, AlternateSupplier } from '../../types/supply-chain';
import { SupplierAIAudit } from '../../types/ai';
import { api } from '../../services/api';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Leaf, 
  Zap, 
  MapPin, 
  Layers,
  ArrowRight, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  alternates?: AlternateSupplier[];
  onClose: () => void;
  onSimulateDisruptionOnNode?: (supplierId: string) => void;
}

export const SupplierDetailDrawer: React.FC<SupplierDetailDrawerProps> = ({
  supplier,
  alternates = [],
  onClose,
  onSimulateDisruptionOnNode,
}) => {
  const [aiAudit, setAiAudit] = useState<SupplierAIAudit | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [selectedAlternateId, setSelectedAlternateId] = useState<string | null>(null);

  if (!supplier) return null;

  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';

  const handleGenerateAIAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await api.auditSupplierWithAI(supplier.id);
      setAiAudit(result);
    } catch (err) {
      console.error('AI Audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-6 w-full sm:w-[420px] max-h-[85vh] sm:max-h-none rounded-t-[32px] sm:rounded-[28px] bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 p-5 sm:p-6 z-50 font-sans shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-200 text-neutral-900 dark:text-slate-100">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 border border-black/[0.06] dark:border-white/10">
              Tier {supplier.tier} Node
            </span>
            <span className="text-xs text-neutral-400 dark:text-slate-500 font-mono font-semibold">{supplier.code}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Name */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border font-mono flex items-center gap-1.5 ${
                isCritical
                  ? 'border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                  : isElevated
                  ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                  : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCritical ? 'bg-rose-600 animate-ping' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {supplier.status}
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 dark:text-slate-500" />
              {supplier.country} ({supplier.countryCode})
            </span>
          </div>

          <h2 className="font-extrabold text-xl text-neutral-900 dark:text-white tracking-tight leading-snug">
            {supplier.name}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-1 font-medium">{supplier.materialCategory}</p>
        </div>

        {/* SPOF Alert Callout */}
        {supplier.isSPOF && (
          <div className="mb-4 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900 dark:text-amber-200">Single Point of Failure (SPOF)</span>
              <span className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 block leading-relaxed">
                Critical sole-source bottleneck. Disruption at this node propagates directly up the CTE graph with 0.7x decay factor.
              </span>
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.05] dark:border-white/10">
            <span className="text-neutral-400 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
              Annual Spend
            </span>
            <span className="text-neutral-900 dark:text-white font-extrabold font-mono text-base mt-0.5 block">
              ${supplier.spend}M USD
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.05] dark:border-white/10">
            <span className="text-neutral-400 dark:text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
              Lead Time
            </span>
            <span className="text-neutral-900 dark:text-white font-extrabold font-mono text-base mt-0.5 block">
              {supplier.leadTimeDays} Days
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.05] dark:border-white/10 col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-neutral-400 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                CTE Risk Exposure Score
              </span>
              <span
                className={`font-mono font-bold text-xs ${
                  isCritical ? 'text-rose-600 dark:text-rose-400' : isElevated ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {Math.round(supplier.riskScore * 100)}% Exposure
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-200/80 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-rose-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.round(supplier.riskScore * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI RISK AUDIT SECTION */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Veritas AI Intelligence Audit</span>
            </span>

            <button
              onClick={handleGenerateAIAudit}
              disabled={isAuditing}
              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{aiAudit ? 'Re-Audit' : 'Run Audit'}</span>
            </button>
          </div>

          {aiAudit ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 dark:border dark:border-indigo-800/40 text-white text-xs shadow-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                  UFLPA SANCTIONS: {aiAudit.uflpaSanctionStatus}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ESG DECARB: {aiAudit.scope3DecarbonizationRating}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2 font-normal">
                {aiAudit.forcedLaborRiskRationale}
              </p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10">
                <span className="text-amber-300 font-medium block">Mitigation Directive:</span>
                <span className="text-slate-200">{aiAudit.recommendedMitigationStrategy}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateAIAudit}
              disabled={isAuditing}
              className="w-full p-3 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Executing Gemini & Groq Audit...' : 'Generate Real-Time AI Risk Audit'}</span>
            </button>
          )}
        </div>

        {/* Pre-Qualified Alternate Suppliers */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Autonomous Reroute Alternates ({alternates.length > 0 ? alternates.length : 1})
          </span>

          <div className="flex flex-col gap-2">
            {(alternates.length > 0 ? alternates : [
              {
                id: 'alt-default',
                name: 'Nordic Horn Maritime Lines (Cape Route)',
                country: 'Norway',
                leadTimeDays: 19,
                leadTimeDeltaDays: -3,
                priceVariancePct: 4.2,
                avoidedScope3Tco2e: 1420.5,
              }
            ]).map((alt: any) => {
              const isSelected = selectedAlternateId === alt.id;
              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlternateId(isSelected ? null : alt.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900/60 border-black/[0.08] dark:border-white/10 shadow-xs hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">{alt.name}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                      +{alt.priceVariancePct ?? 4.2}% Cost
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-slate-400 flex items-center justify-between mt-1">
                    <span>Origin: <strong className="text-neutral-700 dark:text-slate-200">{alt.country}</strong></span>
                    <span>Lead Time: <strong className="text-neutral-700 dark:text-slate-200">{alt.leadTimeDays}d</strong> ({alt.leadTimeDeltaDays ?? -3}d)</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/10 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                      <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Avoids {alt.avoidedScope3Tco2e ?? 1420.5} tCO2e
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                      Pre-Vetted <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disruption Trigger Action Button */}
      {onSimulateDisruptionOnNode && (
        <button
          onClick={() => onSimulateDisruptionOnNode(supplier.id)}
          className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer shadow-xs hover:scale-[1.01]"
        >
          <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Simulate Upstream Shock on this Node</span>
        </button>
      )}
    </div>
  );
};
