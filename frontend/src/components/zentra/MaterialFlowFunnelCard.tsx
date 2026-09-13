'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Layers
} from 'lucide-react';

interface StageData {
  id: string;
  name: string;
  sub: string;
  volume: string;
  pillValue: string;
  height: number;
  isSelected?: boolean;
}

interface MaterialFlowFunnelCardProps {
  onExplorePrompt?: (prompt: string) => void;
  onSelectStage?: (stageId: string) => void;
  isProcessingPrompt?: boolean;
}

export const MaterialFlowFunnelCard: React.FC<MaterialFlowFunnelCardProps> = ({
  onExplorePrompt,
  onSelectStage,
  isProcessingPrompt = false,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('tier-2');
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'I want to know what caused the bottleneck from Tier-3 to semiconductor-fabs'
  );

  const stages: StageData[] = [
    {
      id: 'tier-4',
      name: 'Tier-4 Extraction',
      sub: 'Raw Mining',
      volume: '84.2k',
      pillValue: '+14.2%',
      height: 155,
    },
    {
      id: 'tier-3',
      name: 'Tier-3 Refining',
      sub: 'Smelters',
      volume: '68.5k',
      pillValue: '+8.4%',
      height: 128,
    },
    {
      id: 'tier-2',
      name: 'Tier-2 Fab Supply',
      sub: 'Chips & PCBs',
      volume: '51.3k',
      pillValue: '-18.0%',
      height: 104,
      isSelected: true,
    },
    {
      id: 'tier-1',
      name: 'Tier-1 Assembly',
      sub: 'Battery Packs',
      volume: '42.1k',
      pillValue: '+5.2%',
      height: 82,
    },
    {
      id: 'tier-0',
      name: 'Final Deliveries',
      sub: 'Gigafactory',
      volume: '36.8k',
      pillValue: '+12.1%',
      height: 64,
    },
  ];

  const promptSuggestions = [
    'What caused the bottleneck from Tier-3 to semiconductor fabs?',
    'Analyze UFLPA forced labor risk in Xinjiang silicon smelters',
    'Simulate Red Sea maritime blockade at Bab-el-Mandeb',
    'Calculate Scope-3 carbon savings for Nordic Cape route',
  ];

  const handleStageClick = (id: string) => {
    setSelectedStageId(id);
    if (onSelectStage) onSelectStage(id);
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customPrompt.trim();
    if (!query) return;
    if (onExplorePrompt) {
      onExplorePrompt(query);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setCustomPrompt(text);
    if (onExplorePrompt) {
      onExplorePrompt(text);
    }
  };

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[2];

  return (
    <div className="tactile-card p-4 sm:p-6 md:p-7 select-none font-sans flex flex-col justify-between overflow-hidden">
      {/* TOP LABEL GRID (5 STAGES) - MOBILE HORIZONTALLY SCROLLABLE, DESKTOP 5-COL GRID */}
      <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto sm:overflow-visible gap-3 sm:gap-0 sm:divide-x sm:divide-neutral-200/80 dark:sm:divide-white/10 pb-3 sm:pb-5 border-b border-neutral-100 dark:border-white/10 no-scrollbar">
        {stages.map((st) => {
          const isSelected = selectedStageId === st.id;
          return (
            <div
              key={st.id}
              onClick={() => handleStageClick(st.id)}
              className={`px-3 sm:px-3 py-1.5 sm:py-0 rounded-2xl sm:rounded-none flex flex-col items-center text-center cursor-pointer group shrink-0 sm:shrink min-w-[95px] sm:min-w-0 transition-all ${
                isSelected ? 'bg-neutral-100/70 dark:bg-slate-800/80 sm:bg-transparent' : 'hover:bg-neutral-50 dark:hover:bg-slate-900 sm:hover:bg-transparent'
              }`}
            >
              {/* Extruded micro-capsule badge */}
              <div className={`micro-capsule-3d px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mb-1.5 shadow-xs transition-colors ${
                st.pillValue.startsWith('-') ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-600 dark:text-slate-300'
              }`}>
                {st.pillValue}
              </div>

              {/* Stage Value */}
              <span
                className={`text-base sm:text-lg font-mono font-bold tracking-tight block transition-colors ${
                  isSelected
                    ? 'text-neutral-900 dark:text-white font-extrabold scale-105'
                    : 'text-neutral-700 dark:text-slate-300 group-hover:text-neutral-900 dark:group-hover:text-white'
                }`}
              >
                {st.volume}
              </span>

              {/* Stage Name */}
              <span
                className={`text-[10px] sm:text-[11px] uppercase tracking-tight block mt-0.5 truncate max-w-full ${
                  isSelected
                    ? 'text-neutral-900 dark:text-white font-bold'
                    : 'text-neutral-400 dark:text-slate-400 font-semibold group-hover:text-neutral-600 dark:group-hover:text-slate-200'
                }`}
              >
                {st.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* THE ISOMETRIC 3D BAR GRAPH (SVG WITH CANDY STRIPES & GLASS MONOLITH) */}
      <div className="relative w-full h-[180px] sm:h-[220px] my-2 sm:my-3">
        <svg
          viewBox="0 0 600 200"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Ground grid lines */}
          <line x1="20" y1="185" x2="580" y2="185" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="20" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="75" x2="580" y2="75" stroke="currentColor" className="text-slate-100 dark:text-slate-900" strokeWidth="1" strokeDasharray="3 3" />

          {/* Render 5 volumetric 3D bars */}
          {stages.map((st, i) => {
            const barWidth = 46;
            const x = 50 + i * 110;
            const y = 185 - st.height;
            const dx = 12;
            const dy = 10;
            const isSelected = selectedStageId === st.id;

            return (
              <g 
                key={st.id} 
                onClick={() => handleStageClick(st.id)} 
                className="cursor-pointer transition-opacity duration-200"
                opacity={isSelected ? 1 : 0.82}
              >
                {/* 1. Bar Shadow on ground */}
                <polygon
                  points={`${x},185 ${x + barWidth},185 ${x + barWidth + dx * 1.5},${185 + dy * 0.8} ${x + dx * 1.5},${185 + dy * 0.8}`}
                  fill="#000000"
                  opacity={isSelected ? 0.08 : 0.03}
                />

                {/* 2. Main Front Face */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={st.height}
                  rx="6"
                  fill={
                    i === 0
                      ? 'url(#grad-green)'
                      : i === 1
                      ? 'url(#grad-blue)'
                      : i === 2
                      ? 'url(#grad-pink)'
                      : i === 3
                      ? 'url(#stripe-blue)'
                      : 'url(#grad-orange)'
                  }
                  stroke={isSelected ? '#18181B' : '#CBD5E1'}
                  strokeWidth={isSelected ? '2' : '0.5'}
                />

                {/* 3. 3D Isometric Side Extrusion Face */}
                <polygon
                  points={`${x + barWidth},${y} ${x + barWidth + dx},${y - dy} ${x + barWidth + dx},${185 - dy} ${x + barWidth},185`}
                  fill={
                    i === 0
                      ? '#059669'
                      : i === 1
                      ? '#2563EB'
                      : i === 2
                      ? '#E11D48'
                      : i === 3
                      ? '#1D4ED8'
                      : '#D97706'
                  }
                  opacity={isSelected ? 0.85 : 0.6}
                  stroke="#CBD5E1"
                  strokeWidth="0.5"
                />

                {/* 4. 3D Isometric Top Cap Face */}
                <polygon
                  points={`${x},${y} ${x + dx},${y - dy} ${x + barWidth + dx},${y - dy} ${x + barWidth},${y}`}
                  fill={
                    i === 0
                      ? '#34D399'
                      : i === 1
                      ? '#60A5FA'
                      : i === 2
                      ? '#FB7185'
                      : i === 3
                      ? '#93C5FD'
                      : '#FBBF24'
                  }
                  opacity={isSelected ? 0.95 : 0.75}
                  stroke="#CBD5E1"
                  strokeWidth="0.5"
                />

                {/* Selected Stage Focus Monolith Ring */}
                {isSelected && (
                  <circle
                    cx={x + barWidth / 2 + dx / 2}
                    cy={y - dy / 2}
                    r="5"
                    fill="#18181B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ACTIVE FLOATING TOOLTIP: Anchored above selected stage */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{
            left:
              selectedStageId === 'tier-4'
                ? '15%'
                : selectedStageId === 'tier-3'
                ? '32%'
                : selectedStageId === 'tier-2'
                ? '50%'
                : selectedStageId === 'tier-1'
                ? '68%'
                : '85%',
            top: '4px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="tactile-badge px-3 py-1.5 flex items-center gap-2 whitespace-nowrap text-xs shadow-xl">
            <span className="font-extrabold text-neutral-900 dark:text-white font-mono">{selectedStage.volume} units</span>
            <span className="text-neutral-300 dark:text-slate-600">|</span>
            <span className="text-neutral-600 dark:text-slate-300 font-medium">
              Stage: <strong className="text-neutral-900 dark:text-white">{selectedStage.name}</strong>
            </span>
            <span className="text-neutral-300 dark:text-slate-600 hidden sm:inline">|</span>
            <span className={`font-bold font-mono hidden sm:inline ${
              selectedStage.pillValue.startsWith('-') ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              Variance: {selectedStage.pillValue}
            </span>
          </div>
        </div>
      </div>

      {/* EMBEDDED INTERACTIVE BOTTOM AI COPILOT DOCK */}
      <div 
        className="mt-2 sm:mt-3 rounded-2xl p-3 sm:p-4 border border-sky-200/70 dark:border-sky-500/30 shadow-xs bg-gradient-to-b from-sky-50/70 to-blue-100/80 dark:from-slate-900/90 dark:to-slate-950/95 transition-colors"
      >
        {/* Top Header & Collapse Toggle */}
        <div className="flex items-center justify-between text-xs font-semibold text-sky-950 dark:text-sky-200 mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 fill-sky-600 dark:fill-sky-400" />
            <span className="font-bold">Veritas Autonomous AI Copilot</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/70 dark:bg-slate-800 text-sky-800 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-500/30">
              Gemini & Groq
            </span>
          </div>

          <button
            onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
            className="p-1 text-sky-700 dark:text-sky-400 hover:text-sky-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle Copilot Dock"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isCopilotCollapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>

        {/* Form + Prompt Input + Suggestion Chips */}
        {!isCopilotCollapsed && (
          <div className="space-y-2">
            <form
              onSubmit={handlePromptSubmit}
              className="relative flex items-center bg-white dark:bg-slate-800 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 border border-sky-300/80 dark:border-sky-500/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-sky-500 dark:focus-within:border-cyan-400 transition-colors"
            >
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask Veritas AI (e.g. bottleneck cause, UFLPA sanctions, Red Sea reroute)..."
                className="flex-1 text-xs text-neutral-800 dark:text-slate-100 font-medium outline-none bg-transparent placeholder:text-neutral-400 dark:placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={isProcessingPrompt}
                className="ml-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 dark:bg-cyan-500 hover:bg-neutral-800 dark:hover:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
                title="Run AI query"
              >
                <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isProcessingPrompt ? 'animate-spin' : ''}`} />
              </button>
            </form>

            {/* Prompt Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] uppercase font-mono font-bold text-sky-800 dark:text-sky-300 shrink-0">Try:</span>
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-sky-900 dark:text-sky-200 text-[10px] sm:text-[11px] font-medium border border-sky-200/80 dark:border-sky-500/30 shrink-0 transition-colors cursor-pointer shadow-xs truncate max-w-[260px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
