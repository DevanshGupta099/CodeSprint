'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Constellation of supply chain nodes with additive blended connection lines
function SparseNodeField() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate a sparse, realistic network of 90 supplier nodes in a 3D volume
  const { nodePositions, linePositions } = useMemo(() => {
    const nodeCount = 85;
    const positions: [number, number, number][] = [];
    const maxRadius = 14;

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 4 + Math.random() * (maxRadius - 4);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.6; // Slightly flattened along Y
      const z = r * Math.cos(phi) - 2; // Biased slightly deeper in Z
      positions.push([x, y, z]);
    }

    // Connect nodes within a proximity threshold
    const lines: number[] = [];
    const connectionDist = 4.2;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i][0] - positions[j][0];
        const dy = positions[i][1] - positions[j][1];
        const dz = positions[i][2] - positions[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDist) {
          lines.push(
            positions[i][0], positions[i][1], positions[i][2],
            positions[j][0], positions[j][1], positions[j][2]
          );
        }
      }
    }

    const flatNodes = new Float32Array(positions.flat());
    const flatLines = new Float32Array(lines);

    return { nodePositions: flatNodes, linePositions: flatLines };
  }, []);

  // Slow ambient auto-rotation (pure atmosphere, no user orbit)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
      groupRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Supplier Nodes (Points) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodePositions.length / 3}
            array={nodePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#d97706" // Warm Amber / Rust matching Prologue palette
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Latent Connection Edges (Line Segments) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#b45309"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}

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

    // 2. Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setCanRenderWebGL(!!gl && !mediaQuery.matches);
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
    };
  }, []);

  if (prefersReducedMotion || !canRenderWebGL) {
    return <FallbackStaticBackground />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
      <Canvas
        camera={{ position: [0, 0, 16], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <SparseNodeField />
      </Canvas>
    </div>
  );
};

export default Hero3DBackground;
