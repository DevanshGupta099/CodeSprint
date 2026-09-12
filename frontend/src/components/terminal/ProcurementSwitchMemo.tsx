'use client';

import React, { useState, useEffect } from 'react';
import { MitigationMemo } from '../../types/supply-chain';
import { Terminal, ShieldCheck, ArrowRight, Zap, X, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

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

  // Typewriter effect simulating CRT telemetry stream
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
      index += 3;
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
    <aside className="fixed bottom-16 sm:bottom-20 right-2 sm:right-6 w-full sm:w-[480px] max-w-[calc(100vw-1rem)] bg-[#070D14]/95 border-2 border-cyan-500/50 p-4 z-40 font-mono text-xs shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl crt-overlay crosshair-corner">
      {/* Corner crosshairs */}
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30 text-[10px]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-display font-extrabold text-white uppercase tracking-wider">
            [AUTONOMOUS_PROCUREMENT_SENTINEL // MITIGATION_MEMO]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400/70">
            {new Date(memo.generatedAt).toLocaleTimeString()}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Monospace Typewriter Stream Box */}
      <div className="my-3 p-3 bg-black/70 border border-cyan-500/20 max-h-[130px] overflow-y-auto leading-relaxed text-slate-200 text-[11px]">
        <div className="text-[9px] text-cyan-400/60 uppercase mb-1">
          {'// EXECUTIVE REROUTE DIRECTIVE:'}
        </div>
        <div className="font-mono whitespace-pre-wrap">
          {displayedText}
          {!isTypingComplete && (
            <span className="inline-block w-2 h-3.5 bg-cyan-400 ml-1 animate-blink-cursor" />
          )}
        </div>
      </div>

      {/* Trade-Off Matrix Table */}
      <div className="mb-3 p-2.5 bg-[#0A121D] border border-white/10 text-[10px]">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-slate-400 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5 text-white">
            <Scale className="w-3 h-3 text-cyan-400" />
            [TRADE-OFF DELTA ANALYSIS]
          </span>
          <span className="text-cyan-400 font-mono">TARGET: {memo.alternateName}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Cost Delta */}
          <div className="p-1.5 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">PRICE DELTA</span>
            <span className="text-amber-400 font-bold text-xs font-mono">
              +{memo.priceVariancePct}%
            </span>
            <span className="text-[8px] text-slate-400 block mt-0.5">Insurance offset</span>
          </div>

          {/* Lead Time Delta */}
          <div className="p-1.5 bg-black/40 border border-white/8">
            <span className="text-slate-500 block text-[8px] uppercase">LEAD TIME</span>
            <span className="text-emerald-400 font-bold text-xs font-mono">
              {memo.leadTimeDeltaDays} Days
            </span>
            <span className="text-[8px] text-slate-400 block mt-0.5">39d vs 42d route</span>
          </div>

          {/* Avoided Carbon Delta (SDG 12 Anchor) */}
          <div className="p-1.5 bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-emerald-400 block text-[8px] uppercase">AVOIDED SCOPE-3</span>
            <span className="text-emerald-300 font-bold text-xs font-mono">
              -{memo.avoidedScope3Tco2e}
            </span>
            <span className="text-[8px] text-emerald-400/80 block mt-0.5">tCO2e (SDG 12)</span>
          </div>
        </div>

        {/* ESG & Sanctions Compliance Clearance (SDG 8 Anchor) */}
        <div className="mt-2 pt-1.5 border-t border-white/8 flex items-center justify-between text-[9px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3 h-3" />
            SDG 8 / FORCED LABOR COMPLIANT
          </span>
          <span className="text-slate-400">ISO 14001 · RBA Gold</span>
        </div>
      </div>

      {/* Autonomous Action CTA */}
      <button
        onClick={onExecuteReroute}
        disabled={isExecuting}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(0,255,157,0.45)] hover:shadow-[0_0_35px_rgba(0,255,157,0.7)] cursor-pointer disabled:opacity-60"
      >
        {isExecuting ? (
          <>
            <Zap className="w-4 h-4 animate-spin text-black" />
            <span>[EXECUTING REROUTE // UPDATING DAG CTE...]</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>[CONFIRM & EXECUTE AUTONOMOUS REROUTE]</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </>
        )}
      </button>
    </aside>
  );
};
