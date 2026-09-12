'use client';

import React, { useEffect, useRef } from 'react';

interface WebGLGridProps {
  isDisrupted: boolean;
  disruptionLabel?: string;
}

export const WebGLGridCanvas: React.FC<WebGLGridProps> = ({
  isDisrupted,
  disruptionLabel = 'BAB-EL-MANDEB MARITIME BLOCKADE',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let shockwaveRadius = 0;
    let shockwaveOpacity = 1;
    let scanlineOffset = 0;
    let angle = 0;
    let mouseX = -100;
    let mouseY = -100;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Clear background
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, width, height);

      // 2. Technical Coordinate Grid & Intersections
      const gridSize = 64;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Subtle crosshair tick at grid lines
        for (let y = 0; y < height; y += gridSize) {
          if ((x / gridSize) % 3 === 0 && (y / gridSize) % 3 === 0) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.fillRect(x - 2, y, 5, 1);
            ctx.fillRect(x, y - 2, 1, 5);
          }
        }
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Radar Sweep Line & Sector Arc
      angle = (angle + 0.008) % (Math.PI * 2);
      const centerX = width * 0.45;
      const centerY = height * 0.5;
      const radarRadius = Math.max(width, height) * 0.6;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadius, angle - 0.25, angle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radarRadius);
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
      sweepGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Sweep Ray
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * radarRadius, centerY + Math.sin(angle) * radarRadius);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 4. Stylish Tactical Canvas Text Telemetry (Font: JetBrains Mono / Space Mono)
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';

      // Header Technical Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillText('VERITAS // AUTONOMOUS TIER-N ACTIVE SURVEILLANCE MATRIX', 28, 92);
      ctx.fillText('SEC: 0x4B // MARITIME_CHOKEPOINTS', 28, 108);

      // Lat/Long Coordinate Markers on Perimeter
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.fillText('LAT 12°35\'24"N // LON 43°20\'18"E [BAB-EL-MANDEB]', 28, height - 28);
      ctx.fillText('LAT 23°51\'40"S // LON 69°10\'30"W [ATACAMA]', width - 360, height - 28);

      // Hex Telemetry Stream in Top Right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.textAlign = 'right';
      const frameHash = ((Date.now() / 100) % 10000).toFixed(0);
      ctx.fillText(`STREAM_HASH: 0x${frameHash}FF7B_CTE`, width - 28, 92);
      ctx.fillText('ENCRYPTION: QUANTUM_RESISTANT // 256-BIT', width - 28, 108);
      ctx.textAlign = 'left';

      // Mouse Reticle Tactical Coordinates
      if (mouseX > 0 && mouseY > 0) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, height);
        ctx.moveTo(0, mouseY);
        ctx.lineTo(width, mouseY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.fillText(`LOC: [${mouseX}, ${mouseY}]`, mouseX + 12, mouseY - 12);
      }
      ctx.restore();

      // 5. Disruption Shockwave & Canvas Alert Text
      if (isDisrupted) {
        shockwaveRadius += 6;
        shockwaveOpacity = Math.max(0, 1 - shockwaveRadius / (width * 0.8));

        if (shockwaveRadius < width) {
          // Shockwave Outer Ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 46, 84, ${shockwaveOpacity * 0.75})`;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Shockwave Inner Ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(0, shockwaveRadius - 30), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 46, 84, ${shockwaveOpacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Stylized Shockwave Warning Text on the Canvas
          ctx.save();
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(255, 46, 84, ${shockwaveOpacity * 0.85})`;
          ctx.textAlign = 'center';
          ctx.fillText(
            `[ALERT: ${disruptionLabel} // 0.7x CTE RISK PROPAGATION RADIATING]`,
            centerX,
            centerY - shockwaveRadius - 12
          );
          ctx.restore();
        }
      } else {
        shockwaveRadius = 0;
        shockwaveOpacity = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDisrupted, disruptionLabel]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
