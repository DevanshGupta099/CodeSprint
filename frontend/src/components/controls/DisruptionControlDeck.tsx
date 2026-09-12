'use client';

import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, ChevronUp, Radio, Anchor, ShieldAlert } from 'lucide-react';
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
  const [showScenarioDrawer, setShowScenarioDrawer] = useState(false);

  const currentScenario =
    scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none font-mono">
      {/* Secondary Scenario Selector Drawer */}
      {showScenarioDrawer && (
        <div className="w-[340px] sm:w-[480px] max-w-[92vw] bg-[#0B0F19]/95 border border-white/15 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl mb-1 crosshair-corner">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-[9px] text-slate-400 uppercase tracking-wider">
            <span>[PRESET_DISRUPTION_CATALOG // SELECT_TARGET]</span>
            <button
              onClick={() => setShowScenarioDrawer(false)}
              className="text-slate-400 hover:text-white px-1"
            >
              [CLOSE]
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {scenarios.map((sc) => {
              const isSelected = sc.key === selectedScenarioKey;
              return (
                <button
                  key={sc.key}
                  onClick={() => {
                    onSelectScenario(sc.key);
                    setShowScenarioDrawer(false);
                  }}
                  className={`text-left p-2 border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : 'border-white/8 bg-white/3 hover:bg-white/8 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-display font-bold uppercase text-[11px] text-white">
                      {sc.title}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      TARGET: {sc.targetSupplierName} · {sc.disruptionType}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                      sc.severity >= 0.8
                        ? 'border-rose-500/60 bg-rose-500/20 text-rose-300'
                        : 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {Math.round(sc.severity * 100)}% SEV
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Disruption Control Bar */}
      <div className="flex items-stretch gap-1.5 p-1.5 bg-[#07090E]/95 border border-white/15 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] crosshair-corner">
        {/* Scenario Drawer Toggle */}
        <button
          onClick={() => setShowScenarioDrawer(!showScenarioDrawer)}
          title="Switch disruption target scenario"
          className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">SCENARIO:</span>
          <span className="text-cyan-400 font-bold max-w-[120px] truncate">
            {currentScenario?.key.toUpperCase()}
          </span>
          <ChevronUp className={`w-3 h-3 text-slate-400 transition-transform ${showScenarioDrawer ? 'rotate-180' : ''}`} />
        </button>

        {/* The Main Anchor: [SIMULATE RED SEA BLOCKADE] Button */}
        {isDisrupted ? (
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="group px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 hover:text-white font-display font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400 group-hover:-rotate-90 transition-transform" />
            <span>[RESET SYSTEM TO NOMINAL]</span>
          </button>
        ) : (
          <button
            onClick={() => onSimulate(selectedScenarioKey)}
            disabled={isProcessing}
            className="group relative px-6 py-2.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500 text-white font-display font-extrabold text-xs tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(255,46,84,0.45)] hover:shadow-[0_0_35px_rgba(255,46,84,0.7)] cursor-pointer disabled:opacity-50"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-rose-500" />
            </span>

            <Anchor className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            
            <div className="flex flex-col text-left">
              <span className="text-white tracking-widest text-[11px] sm:text-xs font-black">
                {selectedScenarioKey === 'red-sea'
                  ? '[SIMULATE RED SEA BLOCKADE]'
                  : `[SIMULATE ${currentScenario?.title.toUpperCase()}]`}
              </span>
              <span className="text-[8px] text-rose-300/80 font-mono tracking-normal normal-case hidden sm:inline">
                Bab-el-Mandeb Chokepoint · 0.7x CTE Risk Decay
              </span>
            </div>

            <AlertOctagon className="w-4 h-4 text-rose-400 ml-1 group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
