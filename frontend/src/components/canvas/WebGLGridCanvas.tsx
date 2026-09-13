'use client';

import React, { useEffect, useRef } from 'react';

interface ModernCanvasProps {
  isDisrupted: boolean;
  disruptionLabel?: string;
}

export const WebGLGridCanvas: React.FC<ModernCanvasProps> = ({
  isDisrupted,
  disruptionLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let disruptionPulse = 0;

    // Ambient floating light particles
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
    }));

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Smooth cursor interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // 1. Interactive Cursor Glow (Subtle modern flashlight / mesh effect)
      if (mouseX > -500 && mouseY > -500) {
        const glowRadius = 380;
        const cursorGlow = ctx.createRadialGradient(
          mouseX,
          mouseY,
          0,
          mouseX,
          mouseY,
          glowRadius
        );
        const glowColor = isDisrupted
          ? 'rgba(244, 63, 94, 0.06)'
          : 'rgba(59, 130, 246, 0.06)';
        cursorGlow.addColorStop(0, glowColor);
        cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Subtle Disruption Aura (Smooth border vignette)
      if (isDisrupted) {
        disruptionPulse = (disruptionPulse + 0.02) % (Math.PI * 2);
        const pulseAlpha = 0.08 + Math.sin(disruptionPulse) * 0.04;
        const topGlow = ctx.createLinearGradient(0, 0, 0, 180);
        topGlow.addColorStop(0, `rgba(244, 63, 94, ${pulseAlpha})`);
        topGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, width, 180);
      }

      // 3. Floating Ambient Particles (gives dynamic life to the background)
      ctx.save();
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDisrupted
          ? `rgba(251, 113, 133, ${p.alpha * 0.8})`
          : `rgba(147, 197, 253, ${p.alpha})`;
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDisrupted]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
