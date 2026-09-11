'use client';

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

      // 1. Draw Technical Coordinate Grid
      const gridSize = 45;
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

      // Small subtle corner coordinate crosses at every 3rd intersection
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      for (let x = 0; x < canvas.width; x += gridSize * 3) {
        for (let y = 0; y < canvas.height; y += gridSize * 3) {
          ctx.fillRect(x - 1, y - 1, 3, 3);
        }
      }

      // 2. Slow Radar Sweep
      scanlineOffset = (scanlineOffset + 1.2) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanlineOffset - 90, 0, scanlineOffset);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.035)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanlineOffset - 90, canvas.width, 90);

      // 3. Shockwave Wave Pulse upon Disruption Event
      if (isDisrupted) {
        shockwaveRadius += 4.5;
        const maxDim = Math.max(canvas.width, canvas.height);
        if (shockwaveRadius < maxDim) {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, shockwaveRadius, 0, Math.PI * 2);
          const alpha = Math.max(0, 0.7 - shockwaveRadius / (maxDim * 0.85));
          ctx.strokeStyle = `rgba(255, 46, 84, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          shockwaveRadius = 0;
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
