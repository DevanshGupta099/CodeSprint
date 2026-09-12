'use client';

import React, { useState } from 'react';
import { Flame, ChevronDown } from 'lucide-react';
import { DisruptionScenario } from '../../types/supply-chain';

interface OrbitalDisruptionTriggerProps {
  scenarios: DisruptionScenario[];
  selectedScenarioKey: string;
  onSelectScenario: (key: string) => void;
  onSimulate: (scenarioKey: string) => void;
  isProcessing: boolean;
  isDisrupted: boolean;
  onReset: () => void;
}

export const OrbitalDisruptionTrigger: React.FC<OrbitalDisruptionTriggerProps> = ({
  scenarios,
  selectedScenarioKey,
  onSelectScenario,
  onSimulate,
  isProcessing,
  isDisrupted,
  onReset,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentScenario =
    scenarios.find((s) => s.key === selectedScenarioKey) || scenarios[0];

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 sm:gap-3 select-none pointer-events-auto font-mono max-w-[calc(100vw-2rem)]">
      {/* Scenario Selector Pill */}
      <div className="relative max-w-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="zero-pill px-3 py-1 text-[10px] sm:text-[11px] text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer max-w-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="font-bold text-rose-300 shrink-0">SCENARIO:</span>
          <span className="truncate max-w-[180px] sm:max-w-[260px]">{currentScenario?.title}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {isDropdownOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[300px] sm:w-[340px] max-w-[90vw] zero-card p-1.5 rounded-2xl flex flex-col gap-1 z-40 shadow-2xl">
            {scenarios.map((sc) => (
              <button
                key={sc.key}
                onClick={() => {
                  onSelectScenario(sc.key);
                  setIsDropdownOpen(false);
                }}
                className={`text-left p-2 rounded-xl text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                  sc.key === selectedScenarioKey
                    ? 'bg-rose-500/20 text-white border border-rose-500/40'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">{sc.title}</span>
                  <span className="text-[10px] text-rose-400 font-normal shrink-0 ml-1">
                    {Math.round(sc.severity * 100)}% SEV
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Target: {sc.targetSupplierName}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zero Signature Orbital Disc Trigger Button */}
      <div className="relative flex items-center justify-center">
        {/* Concentric Ripple Waves */}
        <div className="absolute pointer-events-none w-16 sm:w-20 h-16 sm:h-20 rounded-full border border-rose-500/40 orbital-ripple-1" />
        <div className="absolute pointer-events-none w-16 sm:w-20 h-16 sm:h-20 rounded-full border border-rose-500/20 orbital-ripple-2" />

        {/* Circular Trigger */}
        <button
          onClick={() => {
            if (isDisrupted) {
              onReset();
            } else {
              onSimulate(selectedScenarioKey);
            }
          }}
          disabled={isProcessing}
          className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isDisrupted
              ? 'bg-gradient-to-tr from-cyan-500 to-cyan-300 text-black shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-105'
              : 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-[0_0_35px_rgba(255,46,84,0.6)] hover:scale-108 active:scale-95'
          }`}
        >
          {/* Subtle Outer Glowing Ring */}
          <div className="absolute -inset-1 rounded-full border border-white/30 pointer-events-none group-hover:border-white/60 transition-colors" />

          {/* SVG Circular Progress Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="fill-none stroke-white/20 stroke-[2]"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className="fill-none stroke-white stroke-[2.5] transition-all duration-700"
              strokeDasharray="175.9"
              strokeDashoffset={isDisrupted ? '0' : '88'}
            />
          </svg>

          {/* Center Icon */}
          <div className="relative z-10 flex flex-col items-center">
            {isDisrupted ? (
              <span className="text-[9px] sm:text-[10px] font-display font-black tracking-widest uppercase">
                RESET
              </span>
            ) : (
              <>
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
                <span className="text-[7px] sm:text-[8px] font-display font-black tracking-widest uppercase mt-0.5">
                  SHOCK
                </span>
              </>
            )}
          </div>
        </button>

        {/* Floating Side Action Label (Desktop only) */}
        <div className="absolute left-[calc(100%+14px)] whitespace-nowrap pointer-events-none hidden md:flex flex-col text-left">
          <span className="font-display font-black text-xs text-white tracking-tight uppercase">
            {isDisrupted ? '[DISRUPTION ACTIVE]' : '[SIMULATE DISRUPTION]'}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {isDisrupted ? 'Click to restore nominal DAG' : 'Triggers 0.7x recursive CTE attenuation'}
          </span>
        </div>
      </div>
    </div>
  );
};
