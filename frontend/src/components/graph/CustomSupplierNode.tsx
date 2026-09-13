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
  let borderClasses = 'border-black/[0.08] hover:border-black/25';
  let glowClasses = 'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),_0_2px_6px_rgba(0,0,0,0.03)]';
  let statusBadge = (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Nominal
    </span>
  );
  let riskColor = 'text-emerald-700';
  let progressBg = 'bg-emerald-500';

  if (isCritical) {
    borderClasses = 'border-2 border-rose-500';
    glowClasses = 'shadow-[0_16px_36px_-6px_rgba(244,63,94,0.22)] ring-4 ring-rose-500/10';
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shrink-0 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
        Critical
      </span>
    );
    riskColor = 'text-rose-600 font-extrabold';
    progressBg = 'bg-gradient-to-r from-rose-500 to-red-600';
  } else if (isElevated) {
    borderClasses = 'border-2 border-amber-400';
    glowClasses = 'shadow-[0_14px_30px_-6px_rgba(245,158,11,0.18)] ring-2 ring-amber-400/20';
    statusBadge = (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Elevated
      </span>
    );
    riskColor = 'text-amber-700 font-bold';
    progressBg = 'bg-gradient-to-r from-amber-500 to-orange-500';
  }

  // Tier Badge Styling
  const getTierBadge = () => {
    switch (supplier.tier) {
      case 0:
        return <span className="bg-neutral-900 text-white px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 0 · Assembly</span>;
      case 1:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 1 · Subsystem</span>;
      case 2:
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 2 · Component</span>;
      case 3:
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 3 · Refined</span>;
      case 4:
      default:
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">Tier 4 · Raw / Route</span>;
    }
  };

  return (
    <div
      className={`relative w-[320px] p-4 rounded-[22px] bg-white transition-all duration-200 ${borderClasses} ${glowClasses} cursor-pointer select-none ${
        selected ? 'ring-2 ring-blue-600 shadow-[0_16px_36px_rgba(37,99,235,0.18)]' : ''
      }`}
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {getTierBadge()}
          <span className="text-[10px] font-mono text-neutral-400 font-medium">
            {supplier.code}
          </span>
        </div>
        {statusBadge}
      </div>

      {/* Supplier Name & Category */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-neutral-100/90 border border-black/[0.06] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {getNodeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-neutral-900 text-sm tracking-tight leading-snug truncate">
            {supplier.name}
          </h3>
          <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="font-semibold text-neutral-700">{supplier.country}</span>
            <span className="text-neutral-300">·</span>
            <span className="truncate">{supplier.materialCategory}</span>
          </p>
        </div>
      </div>

      {/* SPOF Warning Callout */}
      {isSPOF && (
        <div className="my-2 px-2.5 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-center justify-between text-[11px] text-amber-800 font-medium">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-bold">Single Point of Failure</span>
          </span>
          <span className="text-[9px] text-amber-700 uppercase font-extrabold px-1.5 py-0.5 bg-amber-200/60 rounded">
            Bottleneck
          </span>
        </div>
      )}

      {/* Metrics Row (Spend & Lead Time) */}
      <div className="mt-2.5 pt-2 border-t border-black/[0.06] grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Annual Spend</span>
          <span className="text-neutral-900 font-extrabold font-mono text-sm mt-0.5">
            ${supplier.spend}M USD
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Lead Time</span>
          <span className="text-neutral-900 font-extrabold font-mono text-sm mt-0.5">
            {supplier.leadTimeDays} days
          </span>
        </div>
      </div>

      {/* Disruption Risk Gauge */}
      <div className="mt-2.5 pt-2 border-t border-black/[0.06]">
        <div className="flex justify-between items-center text-[10px] mb-1.5">
          <span className="text-neutral-400 uppercase tracking-wider font-bold">Disruption Risk</span>
          <span className={`font-mono text-[11px] ${riskColor}`}>
            {riskPercent}% {isCritical ? 'Critical' : isElevated ? 'Elevated' : 'Nominal'}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden border border-black/[0.04]">
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
        className="!w-3 !h-3 !rounded-full !bg-white !border-2 !border-neutral-400 hover:!border-blue-600 hover:!scale-125 !transition-all !-left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !rounded-full !bg-white !border-2 !border-neutral-400 hover:!border-blue-600 hover:!scale-125 !transition-all !-right-1.5"
      />
    </div>
  );
});

CustomSupplierNode.displayName = 'CustomSupplierNode';
