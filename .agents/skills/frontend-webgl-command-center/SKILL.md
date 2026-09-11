---
name: frontend-webgl-command-center
description: >-
  Implementation guide and technical runbook for Contributor B on VeritasSupply.
  Covers the Acid Brutalist / Cyberpunk Editorial typography system (Syne + JetBrains Mono),
  WebGL interactive grid canvas, React Flow DAG canvas with Dagre tiered layout, dark glass
  node cards, SPOF hazard badges, [SIMULATE RED SEA BLOCKADE] trigger, and the terminal typewriter memo.
---

# Frontend & WebGL Command Center Workflow (Contributor B)

This skill provides step-by-step instructions, code snippets, and UI architecture for building the **VeritasSupply Enterprise Command Center**.

---

## 1. Typography & Aesthetic Token Setup

### Google Fonts Injection
Add the following to `app/layout.tsx` or `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
```

### Tailwind Config Font Extensions
In `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        hud: ['Space Mono', 'monospace'],
      },
      letterSpacing: {
        brutal: '-0.04em',
        hud: '0.08em',
      },
      colors: {
        command: {
          bg: '#07090E',
          card: 'rgba(11, 15, 25, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
          cyan: '#00F0FF',
          amber: '#FFB800',
          crimson: '#FF2E54',
          emerald: '#00FF9D',
        }
      }
    }
  }
}
```

---

## 2. WebGL / Canvas Background Grid Component

Create `src/components/canvas/WebGLGridCanvas.tsx`:
- Technical coordinate grid with latitude/longitude markers.
- Continuous slow radar sweep line.
- Shockwave radial wave effect when a disruption is simulated:

```typescript
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

      // 1. Draw Technical Grid
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

      // 2. Radar Sweep
      scanlineOffset = (scanlineOffset + 1.2) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanlineOffset - 60, 0, scanlineOffset);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.04)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanlineOffset - 60, canvas.width, 60);

      // 3. Shockwave upon Disruption
      if (isDisrupted) {
        shockwaveRadius += 4;
        if (shockwaveRadius < Math.max(canvas.width, canvas.height)) {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 46, 84, ${Math.max(0, 1 - shockwaveRadius / 1000)})`;
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

## 3. React Flow DAG Auto-Layout with Dagre

```typescript
import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export const getTieredLayout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 160 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 140,
        y: nodeWithPosition.y - 80,
      },
    };
  });
};
```

---

## 4. Custom Dark Glass Node Component

```tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

export const CustomSupplierNode = ({ data, selected }: any) => {
  const isRed = data.status === 'CRITICAL';
  const isAmber = data.status === 'ELEVATED';
  const isSPOF = data.isSPOF;

  return (
    <div className={`relative w-[280px] p-4 rounded-sm backdrop-blur-md transition-all duration-500 border ${
      isRed 
        ? 'bg-rose-950/70 border-rose-500 shadow-[0_0_20px_rgba(255,46,84,0.45)] animate-pulse'
        : isAmber
        ? 'bg-amber-950/60 border-amber-500/80 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
        : 'bg-[#0B0F19]/80 border-white/10 hover:border-cyan-400/50'
    }`}>
      {/* Corner crosshairs */}
      <div className="absolute -top-[2px] -left-[2px] w-2 h-2 border-t border-l border-cyan-400" />
      <div className="absolute -bottom-[2px] -right-[2px] w-2 h-2 border-b border-r border-cyan-400" />

      {/* SPOF Hazard Badge */}
      {isSPOF && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-[10px] tracking-wider uppercase font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          [SPOF // BOTTLENECK]
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
          [TIER {data.tier} // {data.country}]
        </span>
        <span className={`font-mono text-[10px] font-bold ${
          isRed ? 'text-rose-400' : isAmber ? 'text-amber-400' : 'text-cyan-400'
        }`}>
          {data.status}
        </span>
      </div>

      {/* Supplier Name */}
      <h3 className="font-display font-bold text-lg text-white tracking-tight uppercase mt-1 line-clamp-1">
        {data.name}
      </h3>

      {/* Metadata Telemetry */}
      <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-400">
        <div>MAT: <span className="text-white">{data.materialCategory}</span></div>
        <div>SPEND: <span className="text-white">${data.spend}M</span></div>
        <div>LEAD: <span className="text-white">{data.leadTimeDays}d</span></div>
        <div>RISK: <span className={isRed ? 'text-rose-400 font-bold' : 'text-slate-200'}>
          {(data.riskScore * 100).toFixed(0)}%
        </span></div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2 !rounded-none" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2 !rounded-none" />
    </div>
  );
};
```

---

## 5. Terminal-Typed Procurement Switch Memo

- Emulates a high-security military/logistics terminal typing out the reroute plan.
- Calculates and ticks up the running Scope-3 emissions counter.
- Interactive `[CONFIRM & EXECUTE REROUTE]` CTA.
