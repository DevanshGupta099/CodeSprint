'use client';

import React from 'react';
import { ShieldCheck, ArrowRight, TrendingDown, Clock, Leaf } from 'lucide-react';

export const CaseSnapshot: React.FC = () => {
  return (
    <section className="relative w-full bg-[#070B0E] text-white py-24 px-6 sm:px-12 md:px-16 border-t border-white/10 overflow-hidden">
      {/* Background Duotone Texture of Semiconductor Assembly (Unsplash) at 15% opacity */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.14] bg-cover bg-center grayscale mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#070B0E] via-[#070B0E]/90 to-[#070B0E] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header Telemetry */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-white font-semibold">CASE DOSSIER // SCENE 05</span>
            <span className="text-neutral-600">{"//"}</span>
            <span className="text-rose-400">AUDITED ENTERPRISE OUTCOME</span>
          </div>
          <div className="text-[11px] text-neutral-500 uppercase">
            TIER-0 OEM: NORTHWIND ELECTRONICS GMBH
          </div>
        </div>

        {/* Section Headline */}
        <div className="max-w-4xl">
          <div className="font-mono text-xs text-rose-400 tracking-wider uppercase mb-3">
            [ EMPIRICAL VALIDATION // REALIZED MITIGATION ]
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl leading-[0.92] tracking-[-0.04em] text-white">
            Northwind avoided{' '}
            <span className="font-serif italic text-rose-300 font-normal inline-block px-1">
              $4.8M
            </span>{' '}
            in Q3 exposure.
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-300 mt-4 leading-relaxed max-w-2xl font-light">
            When maritime chokepoints in the Bab-el-Mandeb Strait escalated transit delays by 14 days, Veritas autonomously rerouted component lineages to Nordic Horn clean-energy maritime corridors before assembly halted.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Mini Chokepoint -> Reroute Diagram (Small Scale) */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#04080B] border border-rose-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 font-mono text-xs">
              <span className="text-neutral-400">[ AUTONOMOUS GRAPH RECONSTRUCTION ]</span>
              <span className="text-rose-400 font-semibold">EXECUTION: 4.2 SECONDS</span>
            </div>

            {/* Mini SVG Diagram */}
            <div className="my-6 py-4">
              <svg viewBox="0 0 480 180" className="w-full h-auto font-mono select-none">
                <defs>
                  <linearGradient id="miniRoseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#FDA4AF" />
                  </linearGradient>
                </defs>

                {/* Tier-1 Assembly Node */}
                <rect x="20" y="70" width="100" height="40" fill="#1C0E12" stroke="#FB7185" strokeWidth="1.2" />
                <text x="70" y="88" fill="#FFF1F2" fontSize="8" fontWeight="bold" textAnchor="middle">
                  NORTHWIND OEM
                </text>
                <text x="70" y="100" fill="#FDA4AF" fontSize="6.5" textAnchor="middle">
                  TIER-0 ASSEMBLY
                </text>

                {/* Disrupted Chokepoint Branch (Red) */}
                <path d="M 120 80 H 180 V 45 H 240" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="240" y="25" width="150" height="40" fill="#2E0D0D" stroke="#EF4444" strokeWidth="1.2" />
                <text x="250" y="42" fill="#FCA5A5" fontSize="7.5" fontWeight="bold">
                  ⚠ BAB-EL-MANDEB STRAIT
                </text>
                <text x="250" y="55" fill="#EF4444" fontSize="6.5">
                  STATUS: HIGH RISK (+14.2 DAYS)
                </text>

                {/* Autonomous Reroute Spline (Rose) */}
                <path d="M 120 100 H 180 V 135 H 240" fill="none" stroke="#FB7185" strokeWidth="2" />
                <rect x="240" y="115" width="150" height="40" fill="#290B13" stroke="#FB7185" strokeWidth="1.5" />
                <text x="250" y="132" fill="#FFFFFF" fontSize="7.5" fontWeight="bold">
                  ✓ NORDIC HORN MARITIME
                </text>
                <text x="250" y="145" fill="#FDA4AF" fontSize="6.5">
                  STATUS: VERIFIED BYPASS
                </text>

                {/* Status Indicator Icon */}
                <circle cx="410" cy="135" r="8" fill="#FB7185" />
                <path d="M 407 135 L 409 137 L 413 133" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-neutral-400">
              <span>ALGORITHM: POSTGRES RECURSIVE CTE</span>
              <span className="text-rose-400">ZERO DOWNTIME OBSERVED</span>
            </div>
          </div>

          {/* Right: Telemetry Delta Matrix */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric Card 1 */}
            <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>[ RISK INDEX ]</span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-4">
                <div className="text-xs font-mono text-neutral-500 line-through">0.89 CRITICAL</div>
                <div className="font-headline font-black text-4xl sm:text-5xl text-rose-400 mt-1">
                  0.14
                </div>
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                -84% exposure across 3 Tier-2 supplier lineages
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>[ LEAD TIME DELTA ]</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="my-4">
                <div className="text-xs font-mono text-neutral-500">PROJECTED STALL: 14 DAYS</div>
                <div className="font-headline font-black text-4xl sm:text-5xl text-cyan-300 mt-1">
                  +2.8d
                </div>
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                Negligible variance vs. complete factory shutdown
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>[ AVOIDED CARBON ]</span>
                <Leaf className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-4">
                <div className="text-xs font-mono text-neutral-500">SDG 12 TARGET</div>
                <div className="font-headline font-black text-4xl sm:text-5xl text-white mt-1">
                  -1,420<span className="text-xl font-mono text-rose-400 font-normal"> t</span>
                </div>
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                Avoided Scope-3 freight emissions via clean corridor
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="p-6 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>[ SANCTION DEFENSE ]</span>
                <ShieldCheck className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-4">
                <div className="text-xs font-mono text-neutral-500">UFLPA SEC 307</div>
                <div className="font-headline font-black text-4xl sm:text-5xl text-rose-400 mt-1">
                  100%
                </div>
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                Full customs manifest audit compliance verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseSnapshot;
