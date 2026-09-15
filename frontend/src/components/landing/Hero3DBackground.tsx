'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Code-split Three.js & Fiber Canvas into a separate bundle loaded only on demand
const Hero3DCanvas = dynamic(() => import('./Hero3DCanvas'), {
  ssr: false,
  loading: () => <FallbackStaticBackground />,
});

// Fallback duotone CSS constellation for prefers-reduced-motion or missing WebGL
function FallbackStaticBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-25"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 40%, rgba(180, 83, 9, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(217, 119, 6, 0.12) 0%, transparent 40%)`,
      }}
    />
  );
}

export const Hero3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canRenderWebGL, setCanRenderWebGL] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // 2. Check WebGL support & defer mount until user interaction or after idle so initial load has 0ms TBT
    let timerHandle: any;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supported = !!gl && !mediaQuery.matches;

      if (supported) {
        const activate = () => {
          setCanRenderWebGL(true);
          window.removeEventListener('scroll', activate);
          window.removeEventListener('pointerdown', activate);
          window.removeEventListener('keydown', activate);
          if (timerHandle) clearTimeout(timerHandle);
        };

        window.addEventListener('scroll', activate, { passive: true, once: true });
        window.addEventListener('pointerdown', activate, { passive: true, once: true });
        window.addEventListener('keydown', activate, { passive: true, once: true });

        // Standby auto-activation after page load completes
        timerHandle = setTimeout(activate, 15000);
      }
    } catch {
      setCanRenderWebGL(false);
    }

    // 3. Pause WebGL loop when hero is offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      mediaQuery.removeEventListener('change', listener);
      observer.disconnect();
      if (timerHandle) clearTimeout(timerHandle);
    };
  }, []);

  if (prefersReducedMotion || !canRenderWebGL) {
    return <FallbackStaticBackground />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
      <Hero3DCanvas isVisible={isVisible} />
    </div>
  );
};

export default Hero3DBackground;
