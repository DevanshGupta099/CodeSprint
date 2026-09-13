'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  ChevronRight,
  MoreHorizontal
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
}

export const MaterialFlowFunnelCard: React.FC<MaterialFlowFunnelCardProps> = ({
  onExplorePrompt,
  onSelectStage,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('tier-2');
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState<boolean>(false);

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

  const handleStageClick = (id: string) => {
    setSelectedStageId(id);
    if (onSelectStage) onSelectStage(id);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExplorePrompt) {
      onExplorePrompt('I want to know what caused the bottleneck from Tier-3 to /semiconductor-fabs');
    }
  };

  return (
    <div className="tactile-card p-6 sm:p-7 select-none font-sans flex flex-col justify-between overflow-hidden">
      {/* TOP LABEL GRID (5 STAGES) WITH VERTICAL DIVIDERS */}
      <div className="grid grid-cols-5 divide-x divide-neutral-200/80 pb-5 border-b border-neutral-100">
        {stages.map((st) => {
          const isSelected = selectedStageId === st.id;
          return (
            <div
              key={st.id}
              onClick={() => handleStageClick(st.id)}
              className="px-2 sm:px-3 flex flex-col items-center text-center cursor-pointer group"
            >
              {/* Extruded horizontal pill capsule badge (embossed 3D micro-capsule with white gradient highlight) */}
              <div className="micro-capsule-3d px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-neutral-600 mb-2 shadow-xs group-hover:border-neutral-300 transition-colors">
                {st.pillValue}
              </div>

              {/* Stage Value */}
              <span
                className={`text-base sm:text-lg font-mono font-bold tracking-tight block transition-colors ${
                  isSelected
                    ? 'text-neutral-900 font-extrabold scale-105'
                    : 'text-neutral-700 group-hover:text-neutral-900'
                }`}
              >
                {st.volume}
              </span>

              {/* Stage Name */}
              <span
                className={`text-[11px] uppercase tracking-tight block mt-0.5 truncate max-w-full ${
                  isSelected
                    ? 'text-neutral-900 font-bold'
                    : 'text-neutral-400 font-semibold group-hover:text-neutral-600'
                }`}
              >
                {st.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* THE ISOMETRIC 3D BAR GRAPH (SVG WITH CANDY STRIPES & GLASS MONOLITH) */}
      <div className="relative w-full h-[220px] my-3">
        <svg
          viewBox="0 0 600 200"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Ground grid lines */}
          <line x1="20" y1="185" x2="580" y2="185" stroke="#E5E7EB" strokeWidth="1" />

          {/* Render 5 Isometric Bars */}
          {stages.map((st, i) => {
            const barWidth = 62;
            const x = 32 + i * 114;
            const dx = 10;
            const dy = 8;
            const h = st.height;
            const y = 185 - h;
            const isSelected = selectedStageId === st.id;

            return (
              <g
                key={st.id}
                onClick={() => handleStageClick(st.id)}
                className="cursor-pointer group"
              >
                {/* Isometric Drop Shadow to the right */}
                <polygon
                  points={`${x + barWidth},185 ${x + barWidth + dx + 12},185 ${x + barWidth + dx + 12},${185 - dy * 0.4} ${x + barWidth},${185 - dy}`}
                  fill="url(#isoShadow)"
                />

                {isSelected ? (
                  // Bar 3: Selected Illuminated Solid Blue 3D Glass Monolith
                  <g>
                    {/* Glow Filter / Rim Behind */}
                    <rect
                      x={x - 3}
                      y={y - dy - 3}
                      width={barWidth + dx + 6}
                      height={h + dy + 6}
                      rx="6"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      opacity="0.4"
                    />

                    {/* Front Face - Deep Cobalt */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="3"
                      fill="url(#glassFront)"
                      stroke="#1D4ED8"
                      strokeWidth="0.5"
                    />

                    {/* Side Face - Extruded Dark Blue */}
                    <polygon
                      points={`${x + barWidth},${y} ${x + barWidth + dx},${y - dy} ${x + barWidth + dx},${y + h - dy} ${x + barWidth},${y + h}`}
                      fill="url(#glassSide)"
                      stroke="#1E3A8A"
                      strokeWidth="0.5"
                    />

                    {/* Top Face - Glowing Cyan Plane */}
                    <polygon
                      points={`${x},${y} ${x + dx},${y - dy} ${x + barWidth + dx},${y - dy} ${x + barWidth},${y}`}
                      fill="url(#glassTop)"
                      stroke="#7DD3FC"
                      strokeWidth="0.5"
                    />

                    {/* Gloss Reflection Line on Front Face */}
                    <line
                      x1={x + 6}
                      y1={y + 6}
                      x2={x + 6}
                      y2={y + h - 6}
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  // Bars 1, 2, 4, 5: 45-degree url(#stripe-blue) candy stripes with semi-transparent base
                  <g className="opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Front Face Base Color */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="3"
                      fill="#DBEAFE"
                    />
                    {/* Front Face Candy Stripes */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx="3"
                      fill="url(#stripe-blue)"
                      stroke="#2563EB"
                      strokeWidth="0.75"
                    />

                    {/* Side Face */}
                    <polygon
                      points={`${x + barWidth},${y} ${x + barWidth + dx},${y - dy} ${x + barWidth + dx},${y + h - dy} ${x + barWidth},${y + h}`}
                      fill="#1E40AF"
                      stroke="#1E3A8A"
                      strokeWidth="0.5"
                    />

                    {/* Top Face */}
                    <polygon
                      points={`${x},${y} ${x + dx},${y - dy} ${x + barWidth + dx},${y - dy} ${x + barWidth},${y}`}
                      fill="#60A5FA"
                      stroke="#3B82F6"
                      strokeWidth="0.5"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* ACTIVE FLOATING TOOLTIP: Positioned directly above selected bar */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{
            left:
              selectedStageId === 'tier-4'
                ? '11%'
                : selectedStageId === 'tier-3'
                ? '30%'
                : selectedStageId === 'tier-2'
                ? '49%'
                : selectedStageId === 'tier-1'
                ? '68%'
                : '87%',
            top: '8px',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Ultra-Tactile White Pill Tooltip */}
          <div className="tactile-badge px-3.5 py-1.5 flex items-center gap-2 whitespace-nowrap text-xs shadow-lg">
            <span className="font-extrabold text-neutral-900 font-mono">51.3k units</span>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-600 font-medium">
              Throughput: <span className="font-bold text-neutral-900">82%</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="font-bold text-rose-500 font-mono">
              Disruption Risk: -18%
            </span>
          </div>

          {/* Sleek Black OS Cursor SVG Hovering on Active Node */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 drop-shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                fill="#18181B"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* EMBEDDED BOTTOM AI COPILOT DOCK */}
      <div 
        className="mt-3 rounded-2xl p-3.5 border border-sky-200/70 shadow-xs"
        style={{
          background: 'linear-gradient(180deg, rgba(224, 242, 254, 0.45) 0%, rgba(219, 234, 254, 0.85) 100%)',
        }}
      >
        {/* Top Prompt Text */}
        <div className="flex items-center justify-between text-xs font-semibold text-sky-900 mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
            <span>What would you like to explore next?</span>
          </div>

          <button
            onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
            className="p-1 text-sky-700 hover:text-sky-950 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCopilotCollapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>

        {/* Embedded Input Capsule */}
        {!isCopilotCollapsed && (
          <form
            onSubmit={handlePromptSubmit}
            className="relative flex items-center bg-white rounded-full px-4 py-2 border border-sky-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer group"
            onClick={handlePromptSubmit}
          >
            <div className="flex-1 flex items-center gap-1 text-xs text-neutral-700 font-medium overflow-hidden">
              <span className="truncate">
                I want to know what caused the bottleneck from Tier-3 to
              </span>

              {/* Warm Orange Pill Tag */}
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold border border-orange-200 shrink-0 text-[11px]">
                /semiconductor-fabs
              </span>

              {/* Blinking Cursor */}
              <span className="inline-block w-[2px] h-3.5 bg-neutral-900 animate-blink shrink-0 ml-0.5" />
            </div>

            {/* Right Execution Trigger Button */}
            <button
              type="submit"
              className="ml-2 w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
              title="Run query"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
