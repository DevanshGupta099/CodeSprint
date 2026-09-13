'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';

import SmoothScroll from '../components/landing/SmoothScroll';
import Hero3DBackground from '../components/landing/Hero3DBackground';
import CaseSnapshot from '../components/landing/CaseSnapshot';
import TrustCompliance from '../components/landing/TrustCompliance';
import Footer from '../components/landing/Footer';

// ============================================================================
// VERITAS SUPPLY — HIGH-PERFORMANCE ARCHITECTURE & MONOCHROME HUD PALETTE:
//
// 1. VOID CARBON / OBSIDIAN (#000000 / #05070A / #07090E)
//    -> Background void surfaces and glassmorphic cards.
//
// 2. CRISP MONOCHROME WHITE (#FFFFFF / text-white / border-white/20)
//    -> Normal operational state, active indicators, verified routes, and typography.
//
// 3. PURE RED / DANGER ACCENT (#EF4444 / text-red-500 / bg-red-950/40)
//    -> Bottlenecks, chokepoints, anomalies, and financial value-at-risk.
// ============================================================================
// PERFORMANCE ARCHITECTURE:
// - Zero root-level scroll re-renders (Scroll listener isolated to TopInstrumentRuler).
// - Declarative GPU-accelerated Framer Motion whileInView (runs once, zero frame thrash).
// - Hero 3D Canvas pauses rendering automatically when scrolled out of view.
// ============================================================================

// 1. ISOLATED TOP INSTRUMENT RULER (Scroll listener isolated to prevent full-page re-renders)
const TopInstrumentRuler: React.FC = () => {
  const [fraction, setFraction] = useState<number>(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const f = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
          setFraction(f);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pointer-events-auto hidden md:flex items-center gap-4 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg select-none">
      {/* Scene Index Tick Marks */}
      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider">
        <span className={fraction < 0.22 ? 'text-white font-bold' : 'text-neutral-500'}>01</span>
        <span className="text-neutral-600">/</span>
        <span className={fraction >= 0.22 && fraction < 0.48 ? 'text-rose-400 font-bold' : 'text-neutral-500'}>02</span>
        <span className="text-neutral-600">/</span>
        <span className={fraction >= 0.48 && fraction < 0.72 ? 'text-rose-400 font-bold' : 'text-neutral-500'}>03</span>
        <span className="text-neutral-600">/</span>
        <span className={fraction >= 0.72 ? 'text-white font-bold' : 'text-neutral-500'}>04</span>
      </div>

      {/* Millimeter Hashes Ruler */}
      <div className="relative w-36 h-3 flex items-center justify-between border-b border-white/20">
        {Array.from({ length: 19 }).map((_, i) => {
          const isSceneTick = i === 0 || i === 6 || i === 12 || i === 18;
          return (
            <div
              key={i}
              className={`w-[1px] ${isSceneTick ? 'h-3 bg-white/90 shadow-[0_0_4px_#fff]' : i % 3 === 0 ? 'h-2 bg-white/50' : 'h-1 bg-white/20'}`}
            />
          );
        })}
        {/* Absolute indicator pip bound to scroll fraction */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-400 rounded-full transition-transform duration-75"
          style={{ transform: `translateX(${Math.min(136, Math.max(0, fraction * 136))}px) translateY(-50%)` }}
        />
      </div>

      <span className="font-mono text-[10px] tracking-widest text-rose-400 font-bold min-w-[32px]">
        {String(Math.round(fraction * 100)).padStart(3, '0')}%
      </span>
    </div>
  );
};

// ============================================================================
// 2. NATIVE SVG GRAPH MECHANISM (Discrete Scroll-Triggered Kinetic Event)
// ============================================================================
const SupplyGraphMechanism: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '-10% 0px', once: false });

  // Event State Machine: Baseline graph is 100% visible; Event fires on scroll-in
  const [eventTriggered, setEventTriggered] = useState(false);
  const [rerouteDrawn, setRerouteDrawn] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [shockPulse, setShockPulse] = useState(false);

  const fullText = "TRANSIT: -3 DAYS • SCOPE-3: -1,420 tCO2e";

  useEffect(() => {
    if (isInView && !eventTriggered) {
      setEventTriggered(true);
      setShockPulse(true);

      const tShockOff = setTimeout(() => setShockPulse(false), 800);
      const tReroute = setTimeout(() => setRerouteDrawn(true), 250);

      let typeInterval: NodeJS.Timeout;
      const tTypeStart = setTimeout(() => {
        let charIndex = 0;
        typeInterval = setInterval(() => {
          if (charIndex <= fullText.length) {
            setTypedText(fullText.slice(0, charIndex));
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 30);
      }, 850);

      return () => {
        clearTimeout(tShockOff);
        clearTimeout(tReroute);
        clearTimeout(tTypeStart);
        if (typeInterval) clearInterval(typeInterval);
      };
    } else if (!isInView && eventTriggered) {
      setEventTriggered(false);
      setRerouteDrawn(false);
      setTypedText('');
      setShockPulse(false);
    }
  }, [isInView, eventTriggered]);

  const lineLength = 220;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto my-8 p-6 sm:p-10 border border-white/20 bg-[#06080A]/90 rounded-none backdrop-blur-md relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
    >
      {/* Structural Corner Crosshairs */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-white/40 select-none">+</div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-white/40 select-none">+</div>
      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/40 select-none">+</div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/40 select-none">+</div>

      {/* Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 font-mono text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">RECURSIVE CTE RECONSTRUCTION // TIER-0 DOWN TO TIER-4</span>
        </div>
        <div className="text-[11px] text-neutral-400 tracking-wider uppercase flex items-center gap-2">
          <span className={eventTriggered ? 'text-red-500 font-bold' : 'text-neutral-500'}>
            {eventTriggered ? 'ANOMALY DETECTED' : 'MONITORING'}
          </span>
          <span className="text-neutral-600">{"//"}</span>
          <span className={rerouteDrawn ? 'text-white font-bold' : 'text-neutral-500'}>
            {rerouteDrawn ? 'AUTONOMOUS BYPASS ACTIVE' : 'UPSTREAM SYNTHESIS'}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto mt-6 select-none font-mono"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* STEP 1: TIER-0 ENTERPRISE APEX HUB (Always 100% visible: White) */}
        <g>
          <circle cx="100" cy="230" r="28" fill="#0E1118" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="100" cy="230" r="36" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" style={{ transformOrigin: '100px 230px' }} />
          <text x="100" y="278" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" letterSpacing="0.1em">
            [TIER-0 // APEX OEM]
          </text>
          <text x="100" y="292" textAnchor="middle" fill="#A3A3A3" fontSize="8">
            FINISHED PRODUCT
          </text>
        </g>

        {/* STEP 2: ORTHOGONAL LINKS TO 3 TIER-1 FACILITIES (Always 100% visible: White) */}
        <g>
          <path d="M 128 230 H 220 V 110 H 300" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
          <path d="M 128 230 H 300" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
          <path d="M 128 230 H 220 V 350 H 300" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />

          <rect x="300" y="94" width="130" height="32" fill="#11141C" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="312" y="114" fill="#FFFFFF" fontSize="9" fontWeight="bold">T1 // APEX POWERSYS</text>

          <rect x="300" y="214" width="130" height="32" fill="#11141C" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="312" y="234" fill="#FFFFFF" fontSize="9" fontWeight="bold">T1 // VOLTAIC CELL DYN</text>

          <rect x="300" y="334" width="130" height="32" fill="#11141C" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="312" y="354" fill="#FFFFFF" fontSize="9" fontWeight="bold">T1 // DRIVE INVERTER EU</text>
        </g>

        {/* STEP 3: SECONDARY LINKS TO TIER-3 SMELTERS & TIER-4 EXTRACTORS */}
        <g>
          <path d="M 430 110 H 490 V 60 H 550" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.4" />
          <path d="M 430 110 H 490 V 160 H 550" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.4" />
          <path
            d="M 430 230 H 490 V 230 H 550"
            fill="none"
            stroke={eventTriggered ? '#EF4444' : '#FFFFFF'}
            strokeWidth={eventTriggered ? '2' : '1.2'}
            strokeDasharray={eventTriggered ? '4 4' : 'none'}
          />
          <path d="M 430 350 H 490 V 300 H 550" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.4" />
          <path d="M 430 350 H 490 V 400 H 550" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.4" />

          {/* T4 Lithium */}
          <rect x="550" y="46" width="215" height="28" fill="#0E1118" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="560" y="64" fill="#E5E5E5" fontSize="8">T4 // ATACAMA LITHIUM REFINER</text>

          {/* T3 Smelter */}
          <rect x="550" y="146" width="215" height="28" fill="#0E1118" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="560" y="164" fill="#E5E5E5" fontSize="8">T3 // JIANGXI SILICON SMELTER</text>

          {/* T3 Disrupted Node (Bab-el-Mandeb Maritime Chokepoint: DANGER RED) */}
          <rect
            x="550"
            y="216"
            width="215"
            height="28"
            fill={eventTriggered ? '#380E0E' : '#0E1118'}
            stroke={eventTriggered ? '#EF4444' : 'rgba(255,255,255,0.4)'}
            strokeWidth={eventTriggered ? '2' : '1'}
            style={{
              transition: 'fill 0.3s ease, stroke 0.3s ease',
            }}
          />
          <text
            x="558"
            y="234"
            fill={eventTriggered ? '#EF4444' : '#E5E5E5'}
            fontSize="7.8"
            fontWeight={eventTriggered ? 'bold' : 'normal'}
          >
            {eventTriggered ? '⚠ T3 // APEX MARITIME [CHOKEPOINT]' : 'T3 // APEX MARITIME LOGISTICS'}
          </text>

          {/* T4 Cobalt */}
          <rect x="550" y="286" width="215" height="28" fill="#0E1118" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="560" y="304" fill="#E5E5E5" fontSize="8">T4 // KATANGA COBALT MINE</text>

          {/* T4 Copper */}
          <rect x="550" y="386" width="215" height="28" fill="#0E1118" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x="560" y="404" fill="#E5E5E5" fontSize="8">T4 // ZAMBIA COPPER SMELTER</text>
        </g>

        {/* STEP 4: AUTONOMOUS BYPASS REROUTE (White corridor) */}
        {eventTriggered && (
          <g>
            <path
              d="M 430 230 C 470 230, 480 180, 520 180 H 550"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="300"
              strokeDashoffset={rerouteDrawn ? 0 : 300}
              style={{
                transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            <g opacity={rerouteDrawn ? 1 : 0} style={{ transition: 'opacity 300ms ease 200ms' }}>
              <rect
                x="550"
                y="166"
                width="215"
                height="30"
                fill="#181B22"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text x="560" y="185" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                ✓ NORDIC HORN (CAPE ROUTE)
              </text>

              <rect x="550" y="200" width="210" height="15" fill="#0E1118" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              <text x="554" y="211" fill="#FFFFFF" fontSize="7.5" fontWeight="bold">
                {typedText}
                {typedText.length < fullText.length && (
                  <tspan className="animate-pulse" fill="#FFFFFF">▮</tspan>
                )}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Footer Diagnostic Readout */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between font-mono text-[10px] text-neutral-400">
        <div>
          ATTENUATION: <span className="text-white font-bold">0.7x DECAY / HOP</span> • ALGORITHM: <span className="text-white font-bold">POSTGRES RECURSIVE CTE</span>
        </div>
        <div className="text-white font-semibold">
          STATUS: {eventTriggered ? 'AUTONOMOUS REROUTE VERIFIED' : 'MAP ACCURACY: 99.4%'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. STATS COUNT-UP ANIMATION COMPONENT (Scroll-Triggered via Framer Motion)
// ============================================================================
interface AnimatedStatProps {
  prefix?: string;
  target: number;
  suffix?: string;
  decimals?: number;
}

function AnimatedStat({ prefix = '', target, suffix = '', decimals = 0 }: AnimatedStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(ease * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </span>
  );
}

// ============================================================================
// 4. MAIN EDITORIAL LANDING PAGE COMPONENT
// ============================================================================
export default function VeritasEditorialLanding() {
  const router = useRouter();

  // Continuous live telemetry ticking (isolated timer)
  const [monitoredNodes, setMonitoredNodes] = useState(14894);
  const [liveLatency, setLiveLatency] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoredNodes((prev) => prev + Math.floor(Math.random() * 3 + 1));
      setLiveLatency(17 + Math.floor(Math.random() * 3));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Headline Stagger Words for Scene 01
  const headlineWords = ["THEY", "ROT", "AT", "TIER-4"];

  return (
    <SmoothScroll>
      <div className="relative w-full min-h-screen selection:bg-neutral-900 selection:text-white antialiased font-sans bg-[#050508]">
        {/* ===================================================================== */}
        {/* 1. TOP HEADER GRADIENT SCRIM (Prevents typographic collision on scroll) */}
        {/* ===================================================================== */}
        <div
          className="fixed top-0 left-0 right-0 h-24 z-40 pointer-events-none select-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, rgba(5,5,8,0.96) 0%, rgba(5,5,8,0.85) 60%, transparent 100%)',
            backdropFilter: 'blur(6px)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
        />

        {/* ===================================================================== */}
        {/* 2. FIXED TOP INSTRUMENT HEADER BAR                                    */}
        {/* ===================================================================== */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 sm:px-12 flex items-center justify-between pointer-events-none select-none text-white">
          {/* Top-Left Wordmark */}
          <div className="pointer-events-auto">
            <a
              href="#scene-01"
              className="font-serif tracking-tight lowercase text-xl sm:text-2xl text-white font-normal hover:opacity-80 transition-opacity"
            >
              veritas supply
            </a>
          </div>

          {/* Top Center: Mechanical Scroll Instrument with Isolated State */}
          <TopInstrumentRuler />

          {/* Top-Right: Persistent Ambient Telemetry Pill */}
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="font-mono text-xs text-white/80 flex items-center gap-2 px-3 py-1 border border-white/20 rounded-full bg-black/30 backdrop-blur-sm">
              <span className="tracking-widest text-rose-400 font-semibold">{monitoredNodes.toLocaleString()} NODES</span>
            </div>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 3. TACTILE CORNER AFFORDANCE (Bottom-Right - OUT of Content Column)   */}
        {/* ===================================================================== */}
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto select-none">
          <button
            onClick={() => router.push('/dashboard')}
            aria-label="Launch Tactical Sentinel Engine"
            className="group flex items-center gap-2.5 bg-[#090C10]/95 hover:bg-neutral-950 text-white border border-white/20 hover:border-rose-400/60 px-4 py-2.5 rounded-full text-xs font-mono tracking-wider backdrop-blur-xl transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(251,113,133,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-neutral-200 group-hover:text-white font-medium">Sentinel Engine</span>
            <span className="text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform font-bold">↗</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* SCENE 1: THE COLD OPEN (Muted Bone / Parchment Grade)                   */}
        {/* ===================================================================== */}
        <section
          id="scene-01"
          className="relative min-h-screen w-full bg-[#EAE7E1] text-[#1A1917] flex flex-col justify-between pt-28 pb-16 px-6 sm:px-12 md:px-16 overflow-hidden"
        >
          {/* Sparse 3D Particle/Node Field sitting BEHIND headline text */}
          <Hero3DBackground />

          {/* Duotone Maritime Cargo Vessel Photography at 16% opacity */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.16] bg-cover bg-center grayscale mix-blend-multiply"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80')`,
            }}
          />

          {/* Top Metadata */}
          <div className="relative z-10 flex justify-between items-center font-mono text-xs text-[#1A1917]/60 tracking-wider uppercase border-b border-[#1A1917]/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1A1917]">PROLOGUE // SCENE 01</span>
            </div>
            <span className="text-neutral-800 font-semibold">EST. LATENCY: ZERO-TOLERANCE</span>
          </div>

          {/* Asymmetric Bottom-Heavy Editorial Title Card (GPU Accelerated Reveal) */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 my-auto py-12 max-w-7xl will-change-transform"
          >
            <div className="font-headline text-2xl sm:text-4xl md:text-5xl font-normal leading-tight tracking-tight text-[#1A1917]">
              Supply chains don&apos;t break at the{' '}
              <span className="font-serif italic font-normal text-amber-800 text-3xl sm:text-5xl md:text-6xl inline-block px-1">
                surface.
              </span>
            </div>

            {/* Word-by-word stagger animation on headline */}
            <h1 className="font-headline font-black uppercase text-[10vw] sm:text-[12vw] leading-[0.85] tracking-[-0.04em] text-[#1A1917] mt-4 select-none flex flex-wrap gap-x-4 sm:gap-x-8">
              {headlineWords.map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <p className="max-w-2xl font-sans text-base sm:text-lg md:text-xl text-[#1A1917]/75 mt-8 font-normal leading-relaxed">
              Enterprise procurement focuses on direct Tier-1 contracts. But the raw materials, maritime choke points, and unsanctioned refiners that dictate your solvency live four tiers deeper—completely invisible until the assembly line stalls.
            </p>

            {/* In-Flow Section Action Button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-[#1A1917] text-[#EAE7E1] hover:bg-neutral-800 rounded-full font-mono text-xs font-semibold tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>[ Initialize Tactical Engine ↗ ]</span>
              </button>
              <a
                href="#scene-03"
                className="font-mono text-xs text-[#1A1917]/60 hover:text-[#1A1917] transition-colors"
              >
                Skip to Graph Mechanism ↓
              </a>
            </div>
          </motion.div>

          {/* Minimal Monospace Callout (Bottom Bar) */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between pt-8 border-t border-[#1A1917]/10 gap-4">
            <div className="font-mono text-xs text-[#1A1917]/50 tracking-wider">
              VERITAS ARCHITECTURE // AUTONOMOUS AI SENTINEL
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-amber-900 tracking-widest uppercase">
              LATENCY // {liveLatency}ms ACTIVE MONITORING • 42 DAYS TO DISCOVER UPSTREAM SANCTIONS
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SCENE 2: THE EMPIRICAL BEAT (Subdued Slate / Concrete Grade)           */}
        {/* ===================================================================== */}
        <section
          id="scene-02"
          className="relative min-h-screen w-full bg-[#16181D] text-[#E2E4E9] flex flex-col justify-between py-24 px-6 sm:px-12 md:px-16 overflow-hidden"
        >
          {/* Masked Industrial Cleanroom Photo Strip along right edge (18% opacity) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 z-0 pointer-events-none opacity-[0.18] bg-cover bg-center grayscale mix-blend-luminosity hidden lg:block"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80')`,
              maskImage: 'linear-gradient(to right, transparent, black)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
            }}
          />

          {/* Header Telemetry */}
          <div className="relative z-10 flex justify-between items-center font-mono text-xs text-neutral-400 tracking-wider uppercase border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">THE EMPIRICAL BEAT // SCENE 02</span>
            </div>
            <span className="text-rose-400 font-semibold">EMPIRICAL RISK RATIOS</span>
          </div>

          {/* Title Block with Declarative Reveal */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 my-12 max-w-5xl will-change-transform"
          >
            <h2 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.04em] text-white">
              The blind spot is{' '}
              <span className="font-serif italic text-rose-400 font-normal inline-block px-1">
                exponential.
              </span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-neutral-400 mt-6 max-w-2xl leading-relaxed">
              Traditional ERPs and annual vendor questionnaires only capture direct suppliers. When a rare-earth smelter in Jiangxi or a maritime strait in the Red Sea closes, the shockwave compounds up the graph.
            </p>
          </motion.div>

          {/* 3 High-Impact Horizontal Metric Strips with Animated Count-Ups */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 border-t border-b border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Metric A */}
            <div className="py-8 md:px-6 flex flex-col justify-between">
              <span className="font-mono text-xs text-rose-400 font-semibold tracking-wider uppercase">
                [ METRIC A // UPSTREAM HAZARD ]
              </span>
              <div className="my-4">
                <div className="font-headline font-black text-6xl sm:text-7xl lg:text-8xl text-white tracking-tighter">
                  <AnimatedStat target={92} suffix="%" />
                </div>
                <p className="font-sans text-sm sm:text-base text-neutral-300 mt-2 leading-snug">
                  Disruption events originate beyond direct Tier-1 suppliers.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-500">
                ISO_DATE: 2026-09 // RISK_RATIO: 0.92
              </div>
            </div>

            {/* Metric B */}
            <div className="py-8 md:px-6 flex flex-col justify-between">
              <span className="font-mono text-xs text-rose-400 font-semibold tracking-wider uppercase">
                [ METRIC B // VISIBILITY GAP ]
              </span>
              <div className="my-4">
                <div className="font-headline font-black text-6xl sm:text-7xl lg:text-8xl text-white tracking-tighter">
                  <AnimatedStat target={0} />
                </div>
                <p className="font-sans text-sm sm:text-base text-neutral-300 mt-2 leading-snug">
                  Real-time visibility traditional ERPs provide past smelter contracts.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-500">
                SAP / ORACLE TRACEABILITY DEPTH: TIER-1 ONLY
              </div>
            </div>

            {/* Metric C */}
            <div className="py-8 md:px-6 flex flex-col justify-between">
              <span className="font-mono text-xs text-rose-400 font-semibold tracking-wider uppercase">
                [ METRIC C // ENTERPRISE LOSS ]
              </span>
              <div className="my-4">
                <div className="font-headline font-black text-6xl sm:text-7xl lg:text-8xl text-rose-300 tracking-tighter">
                  <AnimatedStat prefix="$" target={4.8} suffix="M" decimals={1} />
                </div>
                <p className="font-sans text-sm sm:text-base text-neutral-300 mt-2 leading-snug">
                  Average enterprise loss per unmitigated maritime/smelter bottleneck.
                </p>
              </div>
              <div className="font-mono text-[10px] text-neutral-500">
                EXPOSURE_INDEX: CUMULATIVE VALUE AT RISK
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 font-mono text-xs text-neutral-500 flex justify-between">
            <span>DATA SOURCE: HARVARD BUSINESS REVIEW &amp; VERITAS BENCHMARKS</span>
            <span>RECURSIVE CTE PROPAGATION</span>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SCENE 3: THE MECHANISM (Pitch Void Grade)                              */}
        {/* ===================================================================== */}
        <section
          id="scene-03"
          className="relative min-h-screen w-full bg-[#07090E] text-[#FFFFFF] flex flex-col justify-between py-24 px-6 sm:px-12 md:px-16"
        >
          {/* Header Telemetry */}
          <div className="flex justify-between items-center font-mono text-xs text-neutral-400 tracking-wider uppercase border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">THE MECHANISM // SCENE 03</span>
            </div>
            <span className="text-white font-semibold">AUTONOMOUS VECTOR GRAPH ENGINE</span>
          </div>

          {/* Section Headline */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="my-8 max-w-4xl will-change-transform"
          >
            <h2 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.04em] text-white">
              Autonomous{' '}
              <span className="font-serif italic text-rose-300 font-normal inline-block px-1">
                reconstruction.
              </span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-neutral-300 mt-4 leading-relaxed">
              Watch the recursive PostgreSQL Common Table Expression rebuild multi-tier dependency paths, identify latent chokepoints, and dynamically synthesize clean trade vectors.
            </p>
          </motion.div>

          {/* The Native SVG Graph Setpiece with Discrete Scroll-Triggered Event */}
          <SupplyGraphMechanism />

          {/* Bottom Readout */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between font-mono text-xs text-rose-400/70">
            <span>SDG 12: RESPONSIBLE PRODUCTION (AVOIDED SCOPE-3: -1,420 tCO2e)</span>
            <span>SDG 8: DECENT WORK / UFLPA FORCED LABOR DEFENSE</span>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SCENE 4: THE TERMINAL CLOSE (Pitch Void Grade)                         */}
        {/* ===================================================================== */}
        <section
          id="scene-04"
          className="relative min-h-screen w-full bg-[#000000] text-[#FFFFFF] flex flex-col justify-between py-24 px-6 sm:px-12 md:px-16 text-center"
        >
          {/* Top Minimal Telemetry */}
          <div className="flex justify-between items-center font-mono text-xs text-neutral-500 tracking-wider uppercase border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">TERMINAL // SCENE 04</span>
            </div>
            <span className="text-rose-400 font-semibold">OPERATIONAL READY</span>
          </div>

          {/* Massive Centered Monolith Typography */}
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="my-auto py-16 flex flex-col items-center justify-center max-w-6xl mx-auto will-change-transform"
          >
            <h2 className="font-headline font-black text-[9vw] sm:text-[10vw] md:text-[11vw] leading-[0.88] tracking-[-0.04em] uppercase text-white select-none">
              SEE THE{' '}
              <span className="font-serif italic text-rose-400 font-normal lowercase inline-block px-2">
                invisible.
              </span>
              <br />
              GOVERN THE NETWORK.
            </h2>

            <p className="max-w-xl font-sans text-base sm:text-lg text-neutral-400 mt-8 leading-relaxed">
              Zero physical sensors. Zero manual vendor questionnaires. Upload a raw bill of materials or connect your enterprise ERP, and synthesize Tier-4 visibility instantly.
            </p>

            {/* Action Beat: Clean oversized pill button */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 sm:px-12 py-5 bg-white text-black hover:bg-neutral-200 font-mono text-sm sm:text-base font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                [ INITIALIZE SYSTEM // LAUNCH DASHBOARD ]
              </button>

              <span className="font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider uppercase">
                NO SENSORS REQUIRED • ZERO HARDWARE • 100% PURE CLOUD INGESTION
              </span>
            </div>
          </motion.div>

          {/* Terminal Footer Navigation */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-neutral-600 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">VERITAS SUPPLY</span>
              <span>{"//"}</span>
              <span>POSTGRES CTEs</span>
              <span>{"//"}</span>
              <span>REACT FLOW COMMAND CENTER</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-400">
              <button
                onClick={() => router.push('/dashboard')}
                className="hover:text-white transition-colors"
              >
                DIRECT DASHBOARD ↗
              </button>
              <span>•</span>
              <span>© 2026 VERITAS INTELLIGENCE</span>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SCENE 5: CASE SNAPSHOT (Audited Enterprise Outcome)                   */}
        {/* ===================================================================== */}
        <CaseSnapshot />

        {/* ===================================================================== */}
        {/* SCENE 6: TRUST & COMPLIANCE (SDG 8 & 12 Alignment + HUD Cert Marks)   */}
        {/* ===================================================================== */}
        <TrustCompliance />

        {/* ===================================================================== */}
        {/* SCENE 7: FULL EDITORIAL FOOTER                                        */}
        {/* ===================================================================== */}
        <Footer monitoredNodes={monitoredNodes} />
      </div>
    </SmoothScroll>
  );
}
