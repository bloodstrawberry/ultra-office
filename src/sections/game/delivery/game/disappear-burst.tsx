"use client";

import React from "react";

export interface DisappearingEffectItem {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export function DisappearBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-visible">
      {/* 1. Expanding Shockwave Ring */}
      <div className="absolute w-full h-full rounded-full border-2 border-amber-400/90 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pop-ring" />

      {/* 2. Secondary White Glow Ring */}
      <div className="absolute w-[80%] h-[80%] rounded-full border border-white/80 animate-pop-ring-inner" />

      {/* 4. Radiating Particle Blast */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full animate-particle-burst-${i}`}
          style={{
            backgroundColor:
              i % 4 === 0
                ? "#fbbf24"
                : i % 4 === 1
                  ? "#f43f5e"
                  : i % 4 === 2
                    ? "#38bdf8"
                    : "#a855f7",
            boxShadow: "0 0 6px currentColor",
          }}
        />
      ))}
    </div>
  );
}

export default DisappearBurst;
