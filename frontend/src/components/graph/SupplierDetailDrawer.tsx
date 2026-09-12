'use client';

import React from 'react';
import { Supplier, AlternateSupplier } from '../../types/supply-chain';
import { X, ShieldCheck, AlertTriangle, Globe, Clock, DollarSign, Leaf, Zap, MapPin } from 'lucide-react';

interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  alternates: AlternateSupplier[];
  onClose: () => void;
  onSimulateDisruptionOnNode?: (supplierId: string) => void;
}

export const SupplierDetailDrawer: React.FC<SupplierDetailDrawerProps> = ({
  supplier,
  alternates,
  onClose,
  onSimulateDisruptionOnNode,
}) => {
  if (!supplier) return null;

  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';

  return (
    <div className="fixed top-14 right-4 bottom-20 w-[360px] max-w-[calc(100vw-2rem)] bg-[#070D14]/95 border border-white/15 p-4 z-30 font-mono shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col justify-between overflow-y-auto crosshair-corner">
      {/* Corner crosshairs */}
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase font-bold">
              [NODE_INSPECTOR // T{supplier.tier}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Name */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={`text-[9px] px-2 py-0.5 border font-bold uppercase ${
                isCritical
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse'
                  : isElevated
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
              }`}
            >
              {supplier.status}
            </span>
            <span className="text-[10px] text-slate-400">{supplier.code}</span>
          </div>

          <h2 className="font-display font-black text-lg text-white uppercase tracking-tight">
            {supplier.name}
          </h2>
          <p className="text-xs text-cyan-400/80 mt-0.5">{supplier.materialCategory}</p>
        </div>

        {/* SPOF Warning if applicable */}
        {supplier.isSPOF && (
          <div className="mb-3 p-2 border border-amber-500/50 bg-amber-950/30 text-amber-300 text-[10px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block uppercase">[SINGLE POINT OF FAILURE]</span>
              <span>Zero redundant alternate contracts in primary tier path.</span>
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
          <div className="p-2 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">ANNUAL SPEND</span>
            <span className="text-white font-bold text-sm">${supplier.spend}M USD</span>
          </div>

          <div className="p-2 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">LEAD TIME</span>
            <span className="text-white font-bold text-sm">{supplier.leadTimeDays} Days</span>
          </div>

          <div className="p-2 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">RISK SCORE</span>
            <span
              className={`font-bold text-sm ${
                isCritical ? 'text-rose-400' : isElevated ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {Math.round((supplier.riskScore || 0) * 100)}%
            </span>
          </div>

          <div className="p-2 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">LOCATION</span>
            <span className="text-white font-bold text-xs truncate block">
              {supplier.country} ({supplier.countryCode})
            </span>
          </div>
        </div>

        {/* ESG Certifications */}
        <div className="mb-4">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1.5 font-bold">
            [ESG & SANCTIONS CERTIFICATIONS]
          </span>
          <div className="flex flex-wrap gap-1.5">
            {supplier.certifications && supplier.certifications.length > 0 ? (
              supplier.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-[9px] flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {cert}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-amber-400">No active ESG certifications audited</span>
            )}
          </div>
        </div>

        {/* Alternate Suppliers */}
        {alternates.length > 0 && (
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1.5 font-bold">
              [CERTIFIED ALTERNATES ({alternates.length})]
            </span>
            <div className="flex flex-col gap-1.5">
              {alternates.map((alt) => (
                <div
                  key={alt.id}
                  className="p-2 bg-black/40 border border-white/8 text-[10px] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{alt.name}</span>
                    <span className="text-[9px] text-slate-400">
                      {alt.country} ({alt.countryCode}) · Lead: {alt.leadTimeDays}d · Price Idx: {alt.priceIndex}
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 bg-emerald-500/10">
                    {alt.emissionsFactor} kgCO2e
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trigger Disruption button on this node */}
      {onSimulateDisruptionOnNode && (
        <button
          onClick={() => onSimulateDisruptionOnNode(supplier.id)}
          className="w-full mt-4 py-2 border border-rose-500/60 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          [TRIGGER UPSTREAM DISRUPTION ON THIS NODE]
        </button>
      )}
    </div>
  );
};
