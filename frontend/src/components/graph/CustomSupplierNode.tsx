'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Supplier } from '../../types/supply-chain';
import { AlertOctagon, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export const CustomSupplierNode = memo((props: any) => {
  const supplier = props.data as Supplier;
  const selected = props.selected;
  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';
  const isSPOF = supplier.isSPOF;

  // Acid Brutalist / Defense HUD Border & Glow Styles
  let cardBorder = 'border-white/12 hover:border-cyan-400/60';
  let cardBg = 'bg-[#0B0F19]/90';
  let cardGlow = 'shadow-[0_10px_35px_rgba(0,0,0,0.7)]';
  let statusText = 'text-cyan-400';
  let statusBadge = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400';

  if (isCritical) {
    cardBorder = 'border-rose-500 animate-pulse';
    cardBg = 'bg-rose-950/70';
    cardGlow = 'shadow-[0_0_35px_rgba(255,46,84,0.55)]';
    statusText = 'text-rose-400 font-bold';
    statusBadge = 'border-rose-500 bg-rose-500/20 text-rose-300';
  } else if (isElevated) {
    cardBorder = 'border-amber-500/80';
    cardBg = 'bg-amber-950/50';
    cardGlow = 'shadow-[0_0_22px_rgba(255,184,0,0.35)]';
    statusText = 'text-amber-400 font-bold';
    statusBadge = 'border-amber-500/60 bg-amber-500/20 text-amber-300';
  }

  const riskPercent = Math.round((supplier.riskScore || 0) * 100);

  return (
    <div
      className={`relative w-[280px] p-3.5 rounded-none backdrop-blur-xl transition-all duration-300 border font-mono ${cardBorder} ${cardBg} ${cardGlow} ${
        selected ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      {/* Corner Crosshairs */}
      <div className="absolute -top-[1.5px] -left-[1.5px] w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -top-[1.5px] -right-[1.5px] w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-[1.5px] -left-[1.5px] w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-[1.5px] -right-[1.5px] w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* SPOF Hazard Badge */}
      {isSPOF && (
        <div
          className={`mb-2 px-2 py-0.5 flex items-center justify-between text-[9px] tracking-widest uppercase font-bold ${
            isCritical ? 'hazard-stripes-crimson text-rose-200' : 'hazard-stripes text-amber-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCritical ? 'bg-rose-400 animate-ping' : 'bg-amber-400 animate-pulse'
              }`}
            />
            [SPOF // BOTTLENECK]
          </span>
          <AlertOctagon className="w-3 h-3" />
        </div>
      )}

      {/* Header Telemetry Row */}
      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-white/8 text-[9px]">
        <span className="text-slate-400 uppercase tracking-widest">
          {`[T${supplier.tier} // ${supplier.countryCode || supplier.country?.substring(0, 3)}]`}
        </span>
        <span className={`px-1.5 py-0.2 border uppercase tracking-wider ${statusBadge}`}>
          {supplier.status}
        </span>
      </div>

      {/* Supplier Name in Industrial Syne Typography */}
      <h3 className="font-display font-black text-sm text-white tracking-tight uppercase line-clamp-1 mb-0.5">
        {supplier.name}
      </h3>

      {/* Component / Commodity Tag */}
      <div className="text-[10px] text-cyan-400/80 truncate mb-2.5">
        {supplier.code} · {supplier.materialCategory}
      </div>

      {/* Telemetry Metric Matrix */}
      <div className="pt-2 border-t border-white/8 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
        <div>
          <span className="text-slate-500">SPEND: </span>
          <span className="text-white font-bold">${supplier.spend}M</span>
        </div>
        <div>
          <span className="text-slate-500">LEAD: </span>
          <span className="text-white font-bold">{supplier.leadTimeDays}d</span>
        </div>
        <div>
          <span className="text-slate-500">ORIGIN: </span>
          <span className="text-slate-300 truncate">{supplier.country}</span>
        </div>
        <div>
          <span className="text-slate-500">RISK: </span>
          <span className={`font-bold ${statusText}`}>{riskPercent}%</span>
        </div>
      </div>

      {/* Square Technical Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !rounded-none !bg-cyan-400 !border !border-black hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !rounded-none !bg-cyan-400 !border !border-black hover:!scale-150 transition-transform"
      />
    </div>
  );
});

CustomSupplierNode.displayName = 'CustomSupplierNode';
