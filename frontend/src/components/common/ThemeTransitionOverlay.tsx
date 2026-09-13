'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleState {
  id: number;
  x: number;
  y: number;
  radius: number;
  theme: 'light' | 'dark';
}

export const ThemeTransitionOverlay: React.FC = () => {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  useEffect(() => {
    const handleRipple = (e: Event) => {
      const customEvent = e as CustomEvent<{
        x: number;
        y: number;
        theme: 'light' | 'dark';
        radius: number;
      }>;
      if (!customEvent.detail) return;

      const newRipple: RippleState = {
        id: Date.now(),
        x: customEvent.detail.x,
        y: customEvent.detail.y,
        radius: customEvent.detail.radius || 1200,
        theme: customEvent.detail.theme,
      };

      setRipples((prev) => [...prev.slice(-1), newRipple]);

      // Remove after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    window.addEventListener('veritas-theme-ripple', handleRipple);
    return () => window.removeEventListener('veritas-theme-ripple', handleRipple);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((r) => {
          const isGoingDark = r.theme === 'dark';
          return (
            <React.Fragment key={r.id}>
              {/* Expanding Shockwave Ring */}
              <motion.div
                initial={{
                  width: 0,
                  height: 0,
                  left: r.x,
                  top: r.y,
                  opacity: 0.85,
                  scale: 0,
                }}
                animate={{
                  width: r.radius * 2.2,
                  height: r.radius * 2.2,
                  left: r.x - r.radius * 1.1,
                  top: r.y - r.radius * 1.1,
                  opacity: 0,
                  scale: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute rounded-full border-2 ${
                  isGoingDark
                    ? 'border-cyan-400 shadow-[0_0_50px_rgba(56,189,248,0.6)]'
                    : 'border-amber-400 shadow-[0_0_50px_rgba(251,146,60,0.6)]'
                }`}
              />

              {/* Ambient Glow Flash */}
              <motion.div
                initial={{ opacity: 0.15 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`absolute inset-0 ${
                  isGoingDark ? 'bg-cyan-500/10' : 'bg-amber-400/10'
                }`}
              />
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
