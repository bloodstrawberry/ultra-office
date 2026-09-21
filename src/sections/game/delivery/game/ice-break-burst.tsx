'use client';

import React from 'react';

export interface IceBreakEffectItem {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Ice Disappearing / Shattering Burst Effect
 * Uses the same circular pop ring & round particle burst structure as the original DisappearBurst,
 * styled with fresh icy cyan, frost white, and crystal blue colors.
 */
export function IceBreakBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-visible">
      {/* 1. Expanding Ice Shockwave Ring */}
      <div className="absolute w-full h-full rounded-full border-2 border-cyan-400/90 shadow-[0_0_15px_rgba(56,189,248,0.85)] animate-pop-ring" />

      {/* 2. Secondary Frost White Glow Ring */}
      <div className="absolute w-[80%] h-[80%] rounded-full border border-sky-100/90 shadow-[0_0_10px_rgba(224,242,254,0.9)] animate-pop-ring-inner" />

      {/* 3. Radiating Ice Particle Blast (8 Circular Dots) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full animate-particle-burst-${i}`}
          style={{
            backgroundColor:
              i % 4 === 0
                ? '#38bdf8' // Ice Cyan
                : i % 4 === 1
                  ? '#e0f2fe' // Frost White
                  : i % 4 === 2
                    ? '#7dd3fc' // Sky Ice Blue
                    : '#0284c7', // Deep Crystal Blue
            boxShadow: '0 0 8px currentColor',
          }}
        />
      ))}
    </div>
  );
}

export default IceBreakBurst;
