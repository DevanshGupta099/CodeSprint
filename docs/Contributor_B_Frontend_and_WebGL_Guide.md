# VeritasSupply — Contributor B Frontend & WebGL Guide

*Enterprise Command Center, Acid Brutalism Typography & Interactive Workflow*

---

## 1. Design Philosophy: Acid Brutalism & Military-SciFi HUD

VeritasSupply is not a generic SaaS dashboard. It is an **Autonomous Supply Chain Command Center** (comparable to Palantir Foundry or Sourcemap) styled with **Acid Brutalism / Neo-Brutalist Cyberpunk Editorial Typography**.

### Visual Rules

1. **Dark Technical Register**: Base background `#07090E` with semi-transparent carbon cards (`rgba(11, 15, 25, 0.75)`), blurred with `backdrop-blur-md`.
2. **Sharp Industrial Edges**: Micro-borders (`1px solid rgba(255,255,255,0.1)`), razor-sharp 0px or 2px border radiuses, and corner crosshair accents.
3. **Typography Pairing**:
   - **Display / Headlines**: **`Syne`** (weights 700 & 800, tight negative tracking `-0.04em`, uppercase, ink traps).
   - **Technical HUD Telemetry**: **`JetBrains Mono`** or **`Space Mono`** for micro-labels, bracketed metadata `[SYS_INIT // 01]`, coordinate tags `[LAT: 12.59 // LNG: 43.32]`, and metrics.
4. **Color-Coded Glow States**:
   - **Nominal**: Muted Cyan (`#00F0FF`) with subtle border glow.
   - **Elevated Caution**: Warning Amber (`#FFB800`) with caution indicators.
   - **Critical Disrupted**: Pulsing Crimson (`#FF2E54`) with shadow bloom `0 0 25px rgba(255, 46, 84, 0.4)`.
   - **SPOF (Single Point of Failure)**: Diagonal hazard stripe border and blinking amber badge.

---

## 2. WebGL / Canvas Background Grid

The background features an interactive WebGL / Canvas coordinate grid with radar sweep lines and an active shockwave pulse when the user hits `[SIMULATE RED SEA BLOCKADE]`.

### Implementation: `components/canvas/WebGLGridCanvas.tsx`

```tsx
import React, { useEffect, useRef } from 'react';

interface WebGLGridProps {
  isDisrupted: boolean;
}

export const WebGLGridCanvas: React.FC<WebGLGridProps> = ({ isDisrupted }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let shockwaveRadius = 0;
    let scanlineOffset = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Coordinate Grid
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Radar Sweep
      scanlineOffset = (scanlineOffset + 1.2) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanlineOffset - 80, 0, scanlineOffset);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.035)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanlineOffset - 80, canvas.width, 80);

      // Shockwave Pulse
      if (isDisrupted) {
        shockwaveRadius += 5;
        if (shockwaveRadius < Math.max(canvas.width, canvas.height)) {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 46, 84, ${Math.max(0, 0.8 - shockwaveRadius / 1200)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        shockwaveRadius = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDisrupted]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
```

---

## 3. React Flow DAG Canvas with Dagre Layout

React Flow renders the tiered dependency graph left-to-right (Tier 0 Enterprise at root, downstream to Tier 4 raw minerals).

### Dagre Layout Utility: `utils/graphLayout.ts`

```typescript
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export const layoutGraph = (nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'LR') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 140, nodesep: 70 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 280, height: 160 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const coord = g.node(node.id);
    return {
      ...node,
      position: {
        x: coord.x - 140,
        y: coord.y - 80,
      },
    };
  });
};
```

---

## 4. Custom Dark Glass Node Component

### Component: `components/graph/CustomSupplierNode.tsx`

```tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

export const CustomSupplierNode = ({ data, selected }: any) => {
  const isRed = data.status === 'CRITICAL';
  const isAmber = data.status === 'ELEVATED';
  const isSPOF = data.isSPOF;

  return (
    <div className={`relative w-[280px] p-4 rounded-none backdrop-blur-md transition-all duration-500 border ${
      isRed 
        ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_25px_rgba(255,46,84,0.4)] animate-pulse'
        : isAmber
        ? 'bg-amber-950/70 border-amber-500/80 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
        : 'bg-[#0B0F19]/80 border-white/10 hover:border-cyan-400/50'
    }`}>
      {/* Corner crosshairs */}
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

      {/* SPOF Hazard Badge */}
      {isSPOF && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/50 text-amber-400 font-mono text-[10px] tracking-wider uppercase font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          [SPOF // BOTTLENECK]
        </div>
      )}

      {/* Header telemetry */}
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
          [TIER_{data.tier} // {data.countryCode}]
        </span>
        <span className={`font-mono text-[10px] font-bold ${
          isRed ? 'text-rose-400' : isAmber ? 'text-amber-400' : 'text-cyan-400'
        }`}>
          [{data.status}]
        </span>
      </div>

      {/* Supplier Name */}
      <h3 className="font-display font-bold text-base text-white tracking-tight uppercase mt-1 line-clamp-1">
        {data.name}
      </h3>

      {/* Telemetry Grid */}
      <div className="mt-3 pt-2 border-t border-white/10 grid grid-cols-2 gap-y-1 gap-x-2 font-mono text-[10px] text-slate-400">
        <div>MATERIAL: <span className="text-white">{data.materialCategory}</span></div>
        <div>SPEND: <span className="text-white">${data.spend}M</span></div>
        <div>LEAD TIME: <span className="text-white">{data.leadTimeDays}d</span></div>
        <div>RISK: <span className={isRed ? 'text-rose-400 font-bold' : 'text-slate-200'}>
          {(data.riskScore * 100).toFixed(0)}%
        </span></div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2 !rounded-none !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2 !rounded-none !border-0" />
    </div>
  );
};
```

---

## 5. Terminal Typewriter Procurement Switch Memo

When a red node is clicked, an autonomous reroute recommendation is synthesized with a typewriter CRT effect:

```tsx
import React, { useState, useEffect } from 'react';

interface MemoProps {
  memoText: string;
  onExecute: () => void;
  onClose: () => void;
}

export const TerminalMitigationMemo: React.FC<MemoProps> = ({ memoText, onExecute, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    setIsDone(false);

    const timer = setInterval(() => {
      if (index < memoText.length) {
        setDisplayedText((prev) => prev + memoText.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsDone(true);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [memoText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#07090E] border-2 border-emerald-500/60 p-6 font-mono text-xs text-emerald-400 shadow-[0_0_40px_rgba(0,255,157,0.25)]">
        {/* Terminal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold tracking-widest">[SYS_AUTONOMOUS_MITIGATION // MEMO_GEN]</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white uppercase font-bold">
            [ESC_CLOSE]
          </button>
        </div>

        {/* Terminal Body with Typewriter */}
        <div className="my-4 whitespace-pre-wrap leading-relaxed min-h-[220px]">
          {displayedText}
          {!isDone && <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />}
        </div>

        {/* Trade-off Telemetry Cards */}
        {isDone && (
          <div className="pt-4 border-t border-emerald-500/30 flex justify-between items-center">
            <div className="flex gap-4">
              <div>COST: <span className="text-amber-300 font-bold">+4.2%</span></div>
              <div>LEAD TIME: <span className="text-emerald-300 font-bold">-3 DAYS</span></div>
              <div>AVOIDED CO2: <span className="text-cyan-300 font-bold">-1,420 tCO2e</span></div>
            </div>
            <button 
              onClick={onExecute}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold uppercase tracking-wider transition-colors">
              [EXECUTE_REROUTE]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 6. The Showstopper Trigger: `[SIMULATE RED SEA BLOCKADE]`

Place this directly in the top HUD navigation bar:

- Button label: `[⚡ SIMULATE RED SEA BLOCKADE]` with industrial hazard diagonal styling.
- On click:
  1. Activates `isDisrupted` state on `WebGLGridCanvas` (triggering shockwave).
  2. Updates node status:
     - `Apex Logistics (Bab-el-Mandeb Strait)` → `CRITICAL` (Red).
     - Downstream parents (`Cathode Assembly`, `Drive Inverter`) → `ELEVATED` (Amber).
     - Finished Good (`Tier-0 EV Manufacturer`) → elevated risk.
  3. Displays notification toast: `[ALERT] Critical chokepoint disrupted. Risk propagated across 3 tiers.`
