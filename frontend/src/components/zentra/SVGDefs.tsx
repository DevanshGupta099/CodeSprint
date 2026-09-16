'use client';

import React from 'react';

export const SVGDefs: React.FC = () => {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Candy Stripe Blue */}
        <pattern id="stripe-blue" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#3B82F6" strokeWidth="4" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#60A5FA" strokeWidth="4" />
        </pattern>

        {/* Candy Stripe Green */}
        <pattern id="stripe-green" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#10B981" strokeWidth="3" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="#34D399" strokeWidth="3" />
        </pattern>

        {/* Candy Stripe Pink */}
        <pattern id="stripe-pink" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#F43F5E" strokeWidth="3" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="#FB7185" strokeWidth="3" />
        </pattern>

        {/* 3D Glass Top Plane Gradient */}
        <linearGradient id="glassTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
        </linearGradient>

        {/* 3D Glass Front Plane Gradient */}
        <linearGradient id="glassFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
        </linearGradient>

        {/* 3D Glass Side Plane Gradient */}
        <linearGradient id="glassSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#172554" stopOpacity="0.95" />
        </linearGradient>

        {/* Gradients for 3D Bar Front Faces */}
        <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="grad-pink" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#E11D48" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
        </linearGradient>

        {/* Isometric Shadow */}
        <linearGradient id="isoShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0, 0, 0, 0.16)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.0)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
