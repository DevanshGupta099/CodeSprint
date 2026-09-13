'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  ChevronDown, 
  Play, 
  Ship, 
  CheckCircle2, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { DisruptionScenario } from '../../types/supply-chain';

interface DisruptionControlDeckProps {
  scenarios: DisruptionScenario[];
  selectedScenarioKey: string;
  onSelectScenario: (key: string) => void;
  onSimulate: (scenarioKey: string) => void;
  isProcessing: boolean;
  isDisrupted: boolean;
  onReset: () => void;
}

export const DisruptionControlDeck: React.FC<DisruptionControlDeckProps> = ({
  scenarios,
  selectedScenarioKey,
  onSelectScenario,
  onSimulate,
  isProcessing,
  isDisrupted,
  onReset,
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const currentScenario =
    scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none font-sans">
      {/* Dropdown Menu for Scenarios */}
      {showScenarioMenu && (
        <div className="w-[380px] max-w-[92vw] mb-2 p-2 rounded-2xl bg-[#0F1422]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-white/[0.06]">
            <span>Preset Stress Tests</span>
            <button
              onClick={() => setShowScenarioMenu(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {scenarios.map((sc) => {
            const isSelected = sc.key === selectedScenarioKey;
            return (
              <button
                key={sc.key}
                onClick={() => {
                  onSelectScenario(sc.key);
                  setShowScenarioMenu(false);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500/50 bg-blue-500/15 text-white shadow-sm'
                    : 'border-transparent hover:bg-white/[0.05] text-slate-300'
                }`}
              >
                <div className="flex flex-col pr-2">
                  <span className="font-semibold text-white">{sc.title}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Target: {sc.targetSupplierName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    sc.severity >= 0.8
                      ? 'border-rose-500/30 bg-rose-500/15 text-rose-300'
                      : 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {Math.round(sc.severity * 100)}% Sev
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Control Bar Pill */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#0F1422]/90 border border-white/[0.12] backdrop-blur-2xl shadow-2xl shadow-black/60">
        {/* Scenario Selector Pill */}
        <button
          onClick={() => setShowScenarioMenu(!showScenarioMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-200 text-xs font-medium transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Scenario</span>
            <span className="font-semibold text-white max-w-[140px] truncate">
              {currentScenario?.title || 'Select Scenario'}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showScenarioMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Primary Action Button */}
        {isDisrupted ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>Disruption Active</span>
            </div>
            <button
              onClick={onReset}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Restore Baseline</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSimulate(selectedScenarioKey)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating CTE Propagation...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Red Sea Blockade</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
