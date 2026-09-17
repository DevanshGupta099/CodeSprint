'use client';

import React, { useState } from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface HeroSunsetMeshCardProps {
  onExploreMitigation?: () => void;
}

export const HeroSunsetMeshCard: React.FC<HeroSunsetMeshCardProps> = React.memo(({
  onExploreMitigation,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      stat: '75%',
      headline: 'Autonomous reroute simulation completed for Malacca Strait.',
      body: 'Alternative rail routing through Central Asia recovered 12 days of delivery lag and protected $1.2M in SLA compliance penalties.',
    },
    {
      stat: '94%',
      headline: 'Autonomous Bab-el-Mandeb bypass verified for European freight.',
      body: 'Cape of Good Hope dual-fuel reroute saved 1,420 tCO2e in Scope-3 emissions while containing price delta to +4.2%.',
    },
    {
      stat: '100%',
      headline: 'UFLPA Section 307 entity clearance completed.',
      body: 'Multi-tier tracing confirmed 14 Tier-1 to Tier-4 supply nodes free of Xinjiang rebuttable presumption risks.',
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="relative rounded-[28px] overflow-hidden p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between select-none font-sans min-h-[300px]">
      {/* Rich Film-Grain Sunset Mesh Gradient: warm radiant peach/orange (#EA580C) to atmospheric cyan/cobalt (#0284C7) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #EA580C 0%, #E11D48 35%, #0284C7 85%, #0EA5E9 100%)',
        }}
      />

      {/* Abstract Translucent 3D Ambient Blur */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none z-0" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-sky-300/20 blur-2xl pointer-events-none z-0" />

      {/* CARD CONTENT (Z-10) */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Pill: Frosted glass capsule with Lightbulb icon - AI Sentinel Insight */}
        <div className="flex items-center justify-between">
          <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Lightbulb className="w-3.5 h-3.5 text-amber-200" />
            <span>AI Sentinel Insight</span>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
            AUTO-CTE
          </span>
        </div>

        {/* Massive Hero Stat: 75% in ultra-crisp white typography */}
        <div className="my-2 sm:my-3">
          <div className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold font-mono tracking-tight text-white leading-none mb-2 drop-shadow-sm">
            {current.stat}
          </div>

          {/* Bold Headline */}
          <h2 className="text-base font-bold text-white tracking-tight leading-snug mb-1.5">
            {current.headline}
          </h2>

          {/* Body Copy */}
          <p className="text-xs text-white/85 leading-relaxed font-normal">
            {current.body}
          </p>
        </div>

        {/* Bottom Carousel Indicator: 3 horizontal glass slider lines with the first line active (longer, solid white) */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="min-w-[24px] min-h-[24px] p-1 cursor-pointer flex items-center justify-center"
                title={`Slide ${idx + 1}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 block ${
                    activeSlide === idx
                      ? 'w-7 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={onExploreMitigation}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
          >
            <span>View Reroute</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

HeroSunsetMeshCard.displayName = 'HeroSunsetMeshCard';

