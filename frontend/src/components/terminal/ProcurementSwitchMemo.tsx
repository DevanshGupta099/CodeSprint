'use client';

import React, { useState, useEffect } from 'react';
import { MitigationMemo } from '../../types/supply-chain';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';

interface ProcurementSwitchMemoProps {
  memo: MitigationMemo | null;
  onExecuteReroute: () => Promise<void>;
  isExecuting: boolean;
  onClose?: () => void;
}

export const ProcurementSwitchMemo: React.FC<ProcurementSwitchMemoProps> = ({
  memo,
  onExecuteReroute,
  isExecuting,
  onClose,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (!memo) {
      setDisplayedText('');
      setIsTypingComplete(false);
      return;
    }

    const fullText = memo.executiveSummary;
    let index = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      index += 5;
      if (index <= fullText.length) {
        setDisplayedText(fullText.substring(0, index));
      } else {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [memo]);

  if (!memo) return null;

  return (
    <aside className="fixed top-20 right-6 bottom-6 w-[440px] max-w-[calc(100vw-3rem)] z-50 rounded-[28px] bg-white border border-black/[0.08] p-6 sm:p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.22)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200 select-none font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            {/* Amber brand gradient emblem matching the Veritas logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-neutral-900 tracking-tight leading-none">
                  Autonomous Mitigation Advisory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-neutral-100 text-neutral-700 border border-black/[0.06]">
                  AI ENGINE
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-medium block mt-1">
                {new Date(memo.generatedAt).toLocaleTimeString()} · Closed-Loop Reroute Synthesis
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Executive Sourcing Directive Terminal (Sleek Obsidian Console matching UI color theme) */}
        <div className="my-4 p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-sky-400">
              EXECUTIVE SOURCING DIRECTIVE // RECURSIVE CTE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              SDG 8 & 12 VERIFIED
            </span>
          </div>

          <p className="whitespace-pre-wrap font-mono text-slate-200 leading-relaxed font-normal text-[11px] sm:text-xs">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 bg-sky-400 ml-1 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Trade-Off Impact Grid (Tactile White Cards matching UI theme) */}
        <div className="mb-4 p-4 rounded-2xl bg-neutral-50 border border-black/[0.05]">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-black/[0.06] text-xs">
            <span className="font-bold text-neutral-800 uppercase tracking-tight font-mono text-[11px]">
              Trade-Off Impact Analysis
            </span>
            <span className="text-xs text-blue-700 font-bold truncate max-w-[220px]">
              Target: {memo.alternateName}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            {/* Cost Delta */}
            <div className="p-3 rounded-xl bg-white border border-black/[0.06] shadow-xs">
              <span className="text-neutral-500 block text-[11px] font-semibold">Cost Delta</span>
              <span className="text-amber-600 font-extrabold font-mono text-base mt-0.5 block">
                +{memo.priceVariancePct}%
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Insurance offset</span>
            </div>

            {/* Lead Time Delta */}
            <div className="p-3 rounded-xl bg-white border border-black/[0.06] shadow-xs">
              <span className="text-neutral-500 block text-[11px] font-semibold">Lead Time</span>
              <span className="text-neutral-900 font-extrabold font-mono text-base mt-0.5 block">
                {memo.leadTimeDeltaDays} Days
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Saved vs delay</span>
            </div>

            {/* Avoided Scope-3 Carbon */}
            <div className="p-3 rounded-xl bg-white border border-black/[0.06] shadow-xs">
              <span className="text-neutral-500 block text-[11px] font-semibold">Avoided CO₂</span>
              <span className="text-neutral-900 font-extrabold font-mono text-base mt-0.5 block">
                -{memo.avoidedScope3Tco2e}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-medium">tCO2e (SDG 12)</span>
            </div>
          </div>

          {/* ESG & Compliance Clearance */}
          <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-700 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>SDG 8 & 12 Clearance Verified</span>
            </span>
            <span className="text-neutral-400 text-[11px] font-mono">ISO 14001 · RBA Gold</span>
          </div>
        </div>
      </div>

      {/* Autonomous Action Button (UI-themed dark carbon pill with amber accent) */}
      <button
        onClick={onExecuteReroute}
        disabled={isExecuting}
        className="w-full py-3.5 px-5 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/15 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {isExecuting ? (
          <>
            <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Executing Autonomous Reroute...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Confirm & Execute Autonomous Reroute</span>
            <ArrowRight className="w-4 h-4 text-white ml-1" />
          </>
        )}
      </button>
    </aside>
  );
};
