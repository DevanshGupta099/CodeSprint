'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Leaf, 
  ArrowRight, 
  Zap, 
  DollarSign, 
  CheckCircle2,
  TrendingDown,
  Layers
} from 'lucide-react';
import { AICopilotResponse } from '../../types/ai';

interface AICopilotModalProps {
  response: AICopilotResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (response: AICopilotResponse) => void;
  isProcessing?: boolean;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  response,
  isOpen,
  onClose,
  onExecuteAction,
  isProcessing = false,
}) => {
  if (!isOpen || !response) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans select-none">
        {/* Soft Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl rounded-[32px] bg-white dark:bg-[#0B0F19] p-6 sm:p-8 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-black/[0.08] dark:border-white/10 max-h-[90vh] overflow-y-auto z-10 text-neutral-900 dark:text-slate-100"
        >
          {/* Top Pill Emblem */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                    VERITAS AI COPILOT
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-slate-400 font-medium">Autonomous Intelligence Engine</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-0.5">
                  {response.headline}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-400 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Query Callout */}
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/70 border border-black/[0.04] dark:border-white/10 mb-4 flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase font-mono text-neutral-400 dark:text-slate-400 shrink-0">QUERY:</span>
            <span className="text-neutral-700 dark:text-slate-200 font-medium italic truncate">&ldquo;{response.query}&rdquo;</span>
          </div>

          {/* Executive Summary */}
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-neutral-400 dark:text-slate-400 mb-1.5">
              Executive Intelligence Briefing
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-slate-200 leading-relaxed font-normal">
              {response.summary}
            </p>
          </div>

          {/* Root Cause & CTE Diagnosis */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 mb-5 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Root Cause Diagnosis & CTE Risk Wave</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-normal">
              {response.rootCauseDiagnosis}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/70 border border-black/[0.04] dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block">Financial Exposure</span>
              <span className="font-mono font-extrabold text-base text-neutral-900 dark:text-white mt-0.5 block">
                {response.riskMetrics.financialExposureUSD}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/70 border border-black/[0.04] dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block">Probability</span>
              <span className="font-mono font-extrabold text-base text-rose-600 dark:text-rose-400 mt-0.5 block">
                {Math.round(response.riskMetrics.probability * 100)}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/70 border border-black/[0.04] dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block">Severity</span>
              <span className="font-mono font-extrabold text-base text-amber-600 dark:text-amber-400 mt-0.5 block">
                {Math.round(response.riskMetrics.severity * 100)}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-900/70 border border-black/[0.04] dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-slate-400 uppercase font-mono block">AI Confidence</span>
              <span className="font-mono font-extrabold text-base text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {Math.round(response.riskMetrics.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* SDG 8 & SDG 12 Anchors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>UN SDG 8 · Decent Work / Forced Labor</span>
              </div>
              <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                {response.riskMetrics.sdgImpact.sdg8ForcedLabor}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>UN SDG 12 · Avoided Scope-3 Carbon</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                {response.riskMetrics.sdgImpact.sdg12AvoidedCarbon}
              </p>
            </div>
          </div>

          {/* Recommendation & Reroute Preview */}
          <div className="p-4 rounded-2xl bg-neutral-900 dark:bg-black/60 dark:border dark:border-white/10 text-white mb-5 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                AUTONOMOUS MITIGATION DIRECTIVE
              </span>
              {response.recommendations.priceVariancePct !== undefined && (
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  +{response.recommendations.priceVariancePct}% Cost Delta
                </span>
              )}
            </div>
            <p className="text-slate-200 text-xs leading-relaxed mb-3">
              {response.recommendations.action}
            </p>
            {response.recommendations.alternateName && (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
                <span>Reroute Alternate: <strong className="text-white">{response.recommendations.alternateName}</strong></span>
                <span className="text-emerald-400">Avoids +{response.recommendations.avoidedScope3Tco2e || 1420.5} tCO2e</span>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            {onExecuteAction && response.suggestedActionLabel && (
              <button
                onClick={() => onExecuteAction(response)}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{response.suggestedActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
