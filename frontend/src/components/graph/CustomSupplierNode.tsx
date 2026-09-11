'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Supplier } from '../../types/supply-chain';
import { AlertTriangle, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export const CustomSupplierNode = memo((props: any) => {
  const supplier = props.data as Supplier;
  const selected = props.selected;
  const isCritical = supplier.status === 'CRITICAL';
  const isElevated = supplier.status === 'ELEVATED';
  const isSPOF = supplier.isSPOF;

  // Zero-Inspired Specular Glass Styles
  let cardBorder = 'border-white/10 hover:border-cyan-400/50';
  let cardBg = 'bg-[#090D15]/85';
  let cardGlow = 'shadow-[0_8px_30px_rgba(0,0,0,0.55)]';
  let statusBadge = 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';

  if (isCritical) {
    cardBorder = 'border-rose-500 animate-pulse';
    cardBg = 'bg-rose-950/80';
    cardGlow = 'shadow-[0_0_35px_rgba(255,46,84,0.5)]';
    statusBadge = 'text-rose-300 border-rose-500/60 bg-rose-500/20';
  } else if (isElevated) {
    cardBorder = 'border-amber-500/80';
    cardBg = 'bg-amber-950/65';
    cardGlow = 'shadow-[0_0_20px_rgba(255,184,0,0.35)]';
    statusBadge = 'text-amber-300 border-amber-500/50 bg-amber-500/20';
  }

  return (
    <div
      className={`relative w-[285px] p-4 rounded-xl backdrop-blur-xl transition-all duration-300 border ${cardBorder} ${cardBg} ${cardGlow} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''
      }`}
      style={{
        boxShadow: isCritical
          ? '0 0 35px rgba(255,46,84,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'
          : '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* Top Specular Micro-Bevel */}
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* SPOF Hazard Pill Badge */}
      {isSPOF && (
        <div className="mb-2.5 flex items-center justify-between px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-[9px] tracking-widest uppercase font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            [SPOF // BOTTLENECK]
          </span>
          <AlertTriangle className="w-3 h-3 text-amber-400" />
        </div>
      )}

      {/* Header Pill Meta */}
      <div className="flex justify-between items-center mb-2">
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[9px] tracking-widest text-slate-300 uppercase">
          T{supplier.tier} · {supplier.countryCode || supplier.country?.substring(0, 3)}
        </span>
        <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border ${statusBadge}`}>
          {supplier.status}
        </span>
      </div>

      {/* Supplier Name in Display Font */}
      <h3 className="font-display font-black text-sm text-white tracking-tight uppercase line-clamp-1 mb-0.5">
        {supplier.name}
      </h3>

      {/* Code & Category */}
      <div className="font-mono text-[10px] text-cyan-300/80 truncate mb-3">
        {supplier.code} · {supplier.materialCategory}
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="pt-2.5 border-t border-white/10 grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-[9px]">
        <div>
          <span className="text-slate-400">SPEND: </span>
          <span className="text-white font-semibold">${supplier.spend}M</span>
        </div>
        <div>
          <span className="text-slate-400">LEAD: </span>
          <span className="text-white font-semibold">{supplier.leadTimeDays}d</span>
        </div>
        <div>
          <span className="text-slate-400">LOC: </span>
          <span className="text-slate-200 truncate">{supplier.country}</span>
        </div>
        <div>
          <span className="text-slate-400">RISK: </span>
          <span
            className={`font-bold ${
              isCritical ? 'text-rose-400' : isElevated ? 'text-amber-400' : 'text-cyan-300'
            }`}
          >
            {Math.round((supplier.riskScore || 0) * 100)}%
          </span>
        </div>
      </div>

      {/* Left (Target) & Right (Source) Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-400 !w-2.5 !h-2.5 !rounded-full !border-2 !border-[#07090E] hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-400 !w-2.5 !h-2.5 !rounded-full !border-2 !border-[#07090E] hover:!scale-150 transition-transform"
      />
    </div>
  );
});

CustomSupplierNode.displayName = 'CustomSupplierNode';
