'use client';

import React from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  Ship, 
  Zap, 
  MapPin, 
  Clock, 
  DollarSign, 
  Leaf, 
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DisruptionScenario, MitigationMemo } from '../../types/supply-chain';

interface DisruptionCenterViewProps {
  scenarios: DisruptionScenario[];
  selectedScenarioKey: string;
  onSelectScenario: (key: string) => void;
  onSimulate: (scenarioKey: string) => void;
  onReset: () => void;
  isProcessing: boolean;
  isDisrupted: boolean;
  activeMemo: MitigationMemo | null;
  onExecuteReroute: () => Promise<void>;
  isExecutingReroute: boolean;
}

export const DisruptionCenterView: React.FC<DisruptionCenterViewProps> = ({
  scenarios,
  selectedScenarioKey,
  onSelectScenario,
  onSimulate,
  onReset,
  isProcessing,
  isDisrupted,
  activeMemo,
  onExecuteReroute,
  isExecutingReroute,
}) => {
  const currentScenario =
    scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];

  return (
    <div className="w-full h-full overflow-y-auto p-6 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Active Status & Actions */}
        <div className="p-6 rounded-2xl bg-[#0B0E17] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isDisrupted
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-white text-lg">
                  {isDisrupted
                    ? 'Disruption Sentinel Alert Active'
                    : 'Autonomous Disruption Sentinel Ready'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDisrupted
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {isDisrupted ? 'CRITICAL ALERT' : 'NOMINAL BASELINE'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isDisrupted
                  ? 'Upstream risk propagated through recursive PostgreSQL CTE (0.7x decay factor).'
                  : 'Select a stress-test scenario below to simulate maritime blockades, mineral export bans, or sanctions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDisrupted ? (
              <button
                onClick={onReset}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Restore Baseline Network</span>
              </button>
            ) : (
              <button
                onClick={() => onSimulate(selectedScenarioKey)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Disruption</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Mitigation Advisory if Disrupted */}
        {activeMemo && (
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    Autonomous Reroute Advisory Memorandum
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Generated via Structured AI Agent · Closed-Loop Autonomous Mitigation
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-mono">
                {new Date(activeMemo.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-200 leading-relaxed">
              <p className="whitespace-pre-wrap">{activeMemo.executiveSummary}</p>
            </div>

            {/* Impact Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
                  Price Variance
                </span>
                <span className="text-amber-400 font-bold font-mono text-base mt-1 block">
                  +{activeMemo.priceVariancePct}%
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Insurance offset</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
                  Transit Time Delta
                </span>
                <span className="text-emerald-400 font-bold font-mono text-base mt-1 block">
                  {activeMemo.leadTimeDeltaDays} Days
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Saved vs delay</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-center">
                <span className="text-[10px] text-emerald-400/90 uppercase tracking-wider font-semibold block">
                  Avoided Scope-3
                </span>
                <span className="text-emerald-300 font-bold font-mono text-base mt-1 block">
                  -{activeMemo.avoidedScope3Tco2e}
                </span>
                <span className="text-[10px] text-emerald-400/70 block mt-0.5">tCO2e (SDG 12)</span>
              </div>
            </div>

            <button
              onClick={onExecuteReroute}
              disabled={isExecutingReroute}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] cursor-pointer"
            >
              {isExecutingReroute ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Executing Autonomous Reroute...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Autonomous Reroute & Swap Alternate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Scenario Catalog Grid */}
        <div>
          <h4 className="text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-3">
            Available Geopolitical Stress Tests
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((sc) => {
              const isSelected = sc.key === selectedScenarioKey;
              return (
                <div
                  key={sc.key}
                  onClick={() => onSelectScenario(sc.key)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#101424] border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#0B0E17] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-white text-sm">{sc.title}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          sc.severity >= 0.8
                            ? 'border-rose-500/30 bg-rose-500/15 text-rose-300'
                            : 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {Math.round(sc.severity * 100)}% Sev
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      {(sc as any).narrative || (sc as any).description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Target Node:</span>
                    <span className="text-white font-medium">{sc.targetSupplierName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
