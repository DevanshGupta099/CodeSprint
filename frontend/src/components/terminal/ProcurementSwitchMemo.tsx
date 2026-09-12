'use client';

import React, { useState, useEffect } from 'react';
import { MitigationMemo } from '../../types/supply-chain';
import { Terminal, CheckCircle2, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import { RollingCounter } from '../common/RollingCounter';

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

  // Typewriter effect
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
      index += 2;
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
    <aside className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 left-0 sm:left-auto w-full sm:w-[430px] max-w-full sm:max-w-[calc(100vw-2rem)] zero-card rounded-t-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl p-3.5 sm:p-4 z-40 font-mono text-xs flex flex-col shadow-[0_12px_45px_rgba(0,0,0,0.85)] border-cyan-500/30 max-h-[75vh] overflow-y-auto">
      {/* Top Specular Micro-Bevel */}
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Terminal Pill Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-black text-xs text-white uppercase tracking-wider hud-shimmer-text">
            AUTONOMOUS_MITIGATION_MEMO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {new Date(memo.generatedAt).toLocaleTimeString()}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Typewriter Stream Box */}
      <div className="my-3 p-3 rounded-xl bg-black/45 border border-white/5 max-h-[140px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-200">
        <pre className="whitespace-pre-wrap font-mono">
          {displayedText}
          {!isTypingComplete && (
            <span className="inline-block w-2 h-3.5 bg-cyan-400 ml-1 animate-blink-cursor" />
          )}
        </pre>
      </div>

      {/* Trade-off Variance Metrics with Rolling Counters */}
      <div className="mb-3">
        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-2 font-semibold flex items-center justify-between">
          <span>[TRADE-OFF TELEMETRY]</span>
          <span className="text-cyan-400 font-bold">{memo.alternateName}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[8px] text-slate-400">PRICE DELTA</div>
            <div className="font-bold text-amber-300 text-xs mt-0.5">
              +{memo.priceVariancePct.toFixed(1)}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[8px] text-slate-400">LEAD TIME</div>
            <div className="font-bold text-cyan-300 text-xs mt-0.5">
              {memo.leadTimeDeltaDays} days
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="text-[8px] text-emerald-400/80">AVOIDED CO2</div>
            <div className="font-bold text-emerald-300 text-xs mt-0.5">
              <RollingCounter
                value={memo.avoidedScope3Tco2e}
                suffix="tCO2e"
                decimals={0}
                className="text-emerald-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Rationale */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-cyan-950/25 border border-cyan-500/30 text-[9px] text-cyan-200 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>{memo.complianceRationale}</span>
      </div>

      {/* Execute Reroute CTA Button */}
      <button
        onClick={onExecuteReroute}
        disabled={isExecuting}
        className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-display font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.65)] transition-all cursor-pointer disabled:opacity-50"
      >
        {isExecuting ? (
          <>
            <Zap className="w-4 h-4 animate-spin" />
            <span>[COMMITTING REROUTE TO POSTGRES CTE...]</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>[CONFIRM & EXECUTE REROUTE]</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </aside>
  );
};
