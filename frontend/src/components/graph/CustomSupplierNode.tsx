'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Supplier } from '../../types/supply-chain';
import { 
  AlertTriangle, 
  Cpu, 
  Ship, 
  Factory, 
  Layers, 
  Gem, 
  MapPin,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-react';

export const CustomSupplierNode = memo((props: any) => {
  const supplier = props.data as Supplier;
  const selected = props.selected;
  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';
  const isSPOF = supplier.isSPOF;

  // Node Icon based on material category / tier
  const getNodeIcon = () => {
    const cat = (supplier.materialCategory || '').toLowerCase();
    if (cat.includes('shipping') || cat.includes('freight') || cat.includes('maritime') || cat.includes('logistics')) {
      return <Ship className="w-4 h-4 text-cyan-700" />;
    }
    if (cat.includes('lithium') || cat.includes('cobalt') || cat.includes('raw') || cat.includes('ore') || cat.includes('silicon')) {
      return <Gem className="w-4 h-4 text-emerald-700" />;
    }
    if (cat.includes('semiconductor') || cat.includes('wafer') || cat.includes('chip') || cat.includes('bms')) {
      return <Cpu className="w-4 h-4 text-indigo-700" />;
    }
    if (supplier.tier === 0 || cat.includes('vehicle') || cat.includes('assembly')) {
      return <Factory className="w-4 h-4 text-blue-700" />;
    }
    return <Layers className="w-4 h-4 text-slate-700" />;
  };

  const riskPercent = Math.round((supplier.riskScore || 0) * 100);

  // Status-driven styling
  let borderClasses = 'border-black/[0.08] dark:border-white/10 hover:border-black/25 dark:hover:border-cyan-500/40';
  let glowClasses = 'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),_0_2px_6px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)]';
  let statusBadge = (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Nominal
    </span>
  );
  let riskColor = 'text-emerald-700 dark:text-emerald-400';
  let progressBg = 'bg-emerald-500';

  if (isCritical) {
    borderClasses = 'border-2 border-rose-500';
    glowClasses = 'shadow-[0_16px_36px_-6px_rgba(244,63,94,0.22)] dark:shadow-[0_16px_36px_-6px_rgba(244,63,94,0.4)] ring-4 ring-rose-500/10';
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 shrink-0 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
        Critical
      </span>
    );
    riskColor = 'text-rose-600 dark:text-rose-400 font-extrabold';
    progressBg = 'bg-gradient-to-r from-rose-500 to-red-600';
  } else if (isElevated) {
    borderClasses = 'border-2 border-amber-400';
    glowClasses = 'shadow-[0_14px_30px_-6px_rgba(245,158,11,0.18)] dark:shadow-[0_14px_30px_-6px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/20';
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Elevated
      </span>
    );
    riskColor = 'text-amber-700 dark:text-amber-400 font-bold';
    progressBg = 'bg-gradient-to-r from-amber-500 to-orange-500';
  }

  // Tier Badge Styling
  const getTierBadge = () => {
    switch (supplier.tier) {
      case 0:
        return <span className="bg-neutral-900 dark:bg-white text-white dark:text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 0 · Assembly</span>;
      case 1:
        return <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 1 · Subsystem</span>;
      case 2:
        return <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 2 · Component</span>;
      case 3:
        return <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 3 · Refined</span>;
      case 4:
      default:
        return <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 4 · Raw / Route</span>;
    }
  };

  return (
    <div
      className={`relative w-[320px] p-4 rounded-[22px] bg-white dark:bg-[#0B0F19]/95 text-neutral-900 dark:text-slate-100 transition-all duration-200 ${borderClasses} ${glowClasses} cursor-pointer select-none ${
        selected ? 'ring-2 ring-blue-600 dark:ring-cyan-400 shadow-[0_16px_36px_rgba(37,99,235,0.18)] dark:shadow-[0_16px_36px_rgba(56,189,248,0.25)]' : ''
      }`}
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getTierBadge()}
          <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-500 font-medium">
            {supplier.code}
          </span>
        </div>
        {statusBadge}
      </div>

      {/* Supplier Name & Category */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-neutral-100/90 dark:bg-slate-800 border border-black/[0.06] dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {getNodeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm tracking-tight leading-snug truncate">
            {supplier.name}
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-neutral-400 dark:text-slate-500 shrink-0" />
            <span className="font-semibold text-neutral-700 dark:text-slate-300">{supplier.country}</span>
            <span className="text-neutral-300 dark:text-slate-600">·</span>
            <span className="truncate">{supplier.materialCategory}</span>
          </p>
        </div>
      </div>

      {/* SPOF Warning Callout */}
      {isSPOF && (
        <div className="my-2 px-2.5 py-1.5 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.15] border border-amber-500/25 dark:border-amber-500/40 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 font-medium">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold">Single Point of Failure</span>
          </span>
          <span className="text-[9px] text-amber-700 dark:text-amber-300 uppercase font-extrabold px-1.5 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 rounded">
            Bottleneck
          </span>
        </div>
      )}

      {/* Metrics Row (Spend & Lead Time) */}
      <div className="mt-2.5 pt-2 border-t border-black/[0.06] dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 dark:text-slate-500 uppercase tracking-wider font-bold">Annual Spend</span>
          <span className="text-neutral-900 dark:text-white font-extrabold font-mono text-sm mt-0.5">
            ${supplier.spend}M USD
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 dark:text-slate-500 uppercase tracking-wider font-bold">Lead Time</span>
          <span className="text-neutral-900 dark:text-white font-extrabold font-mono text-sm mt-0.5">
            {supplier.leadTimeDays} days
          </span>
        </div>
      </div>

      {/* Disruption Risk Gauge */}
      <div className="mt-2.5 pt-2 border-t border-black/[0.06] dark:border-white/10">
        <div className="flex justify-between items-center text-[10px] mb-1.5">
          <span className="text-neutral-400 dark:text-slate-500 uppercase tracking-wider font-bold">Disruption Risk</span>
          <span className={`font-mono text-[11px] ${riskColor}`}>
            {riskPercent}% {isCritical ? 'Critical' : isElevated ? 'Elevated' : 'Nominal'}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-slate-800 overflow-hidden border border-black/[0.04] dark:border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
            style={{ width: `${Math.min(Math.max(riskPercent, 4), 100)}%` }}
          />
        </div>
      </div>

      {/* Circular tactile connection ports (Left: Target from Upstream, Right: Source to Downstream) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !rounded-full !bg-white dark:!bg-slate-800 !border-2 !border-neutral-400 dark:!border-slate-500 hover:!border-blue-600 dark:hover:!border-cyan-400 hover:!scale-125 !transition-all !-left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !rounded-full !bg-white dark:!bg-slate-800 !border-2 !border-neutral-400 dark:!border-slate-500 hover:!border-blue-600 dark:hover:!border-cyan-400 hover:!scale-125 !transition-all !-right-1.5"
      />
    </div>
  );
});

CustomSupplierNode.displayName = 'CustomSupplierNode';
