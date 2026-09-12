'use client';

import React from 'react';
import { Supplier, AlternateSupplier } from '../../types/supply-chain';
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
  CheckCircle2
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
  if (!supplier) return null;

  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';

  return (
    <div className="fixed top-20 right-6 bottom-6 w-[400px] max-w-[calc(100vw-3rem)] rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.08] p-6 z-50 font-sans shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-neutral-100 text-neutral-800 border border-black/[0.06]">
              Tier {supplier.tier} Supplier
            </span>
            <span className="text-xs text-neutral-400 font-mono font-semibold">{supplier.code}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Name */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border font-mono flex items-center gap-1.5 ${
                isCritical
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : isElevated
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCritical ? 'bg-rose-600 animate-ping' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {supplier.status}
            </span>
            <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {supplier.country} ({supplier.countryCode})
            </span>
          </div>

          <h2 className="font-extrabold text-xl text-neutral-900 tracking-tight leading-snug">
            {supplier.name}
          </h2>
          <p className="text-xs text-neutral-500 mt-1 font-medium">{supplier.materialCategory}</p>
        </div>

        {/* SPOF Alert Callout */}
        {supplier.isSPOF && (
          <div className="mb-4 p-3.5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900">Single Point of Failure (SPOF)</span>
              <span className="text-[11px] text-amber-800 mt-0.5 block leading-relaxed">
                Critical sole-source bottleneck. Disruption at this node propagates directly up the CTE graph with 0.7x decay factor.
              </span>
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.05]">
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-bold">
              Annual Spend
            </span>
            <span className="text-neutral-900 font-extrabold font-mono text-base mt-0.5 block">
              ${supplier.spend}M USD
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.05]">
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-bold">
              Lead Time
            </span>
            <span className="text-neutral-900 font-extrabold font-mono text-base mt-0.5 block">
              {supplier.leadTimeDays} Days
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.05] col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-bold">
                CTE Risk Exposure Score
              </span>
              <span
                className={`font-mono font-bold text-xs ${
                  isCritical ? 'text-rose-600' : isElevated ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {Math.round(supplier.riskScore * 100)}% Exposure
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-rose-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.round(supplier.riskScore * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pre-Qualified Alternate Suppliers */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2 font-mono">
            Autonomous Reroute Alternates ({alternates.length > 0 ? alternates.length : 1})
          </span>

          <div className="flex flex-col gap-2">
            {/* If alternates array provided, render them; otherwise render the standard pre-vetted failover for this node */}
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
            ]).map((alt: any) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-2xl bg-white border border-black/[0.08] shadow-xs hover:border-black/20 transition-all text-xs"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-neutral-900 text-xs">{alt.name}</span>
                  <span className="text-amber-600 font-mono text-[11px] font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    +{alt.priceVariancePct ?? 4.2}% Cost
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center justify-between mt-1">
                  <span>Origin: <strong className="text-neutral-700">{alt.country}</strong></span>
                  <span>Lead Time: <strong className="text-neutral-700">{alt.leadTimeDays}d</strong> ({alt.leadTimeDeltaDays ?? -3}d)</span>
                </div>
                <div className="mt-2 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                    <Leaf className="w-3 h-3 text-emerald-600" />
                    Avoids {alt.avoidedScope3Tco2e ?? 1420.5} tCO2e
                  </span>
                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    Pre-Vetted <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disruption Trigger Action Button */}
      {onSimulateDisruptionOnNode && (
        <button
          onClick={() => onSimulateDisruptionOnNode(supplier.id)}
          className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer shadow-xs hover:scale-[1.01]"
        >
          <Zap className="w-4 h-4 text-rose-600" />
          <span>Simulate Upstream Shock on this Node</span>
        </button>
      )}
    </div>
  );
};
