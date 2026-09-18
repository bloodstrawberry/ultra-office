'use client';

import type { Position } from './types';

import React from 'react';

interface ShisenShoLineProps {
  path: Position[] | null;
  cols: number;
  rows: number;
}

/**
 * Renders the matching connection path line over the Shisen-Sho board.
 * Uses relative percentages (0..cols, 0..rows) so it perfectly scales with any screen size.
 */
export function ShisenShoLine({ path, cols, rows }: ShisenShoLineProps) {
  if (!path || path.length < 2) return null;

  // ViewBox spans from -1.0 to (cols + 1.0) and -1.0 to (rows + 1.0) to accommodate perimeter lines
  const minX = -0.5;
  const minY = -0.5;
  const viewBoxWidth = cols + 1.0;
  const viewBoxHeight = rows + 1.0;

  // Convert grid coordinates (x, y) to cell center points (x + 0.5, y + 0.5)
  const pointsString = path
    .map((p) => {
      const cx = p.x + 0.5;
      const cy = p.y + 0.5;
      return `${cx},${cy}`;
    })
    .join(' ');

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
      <svg
        viewBox={`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full overflow-visible animate-pulse"
        style={{
          filter:
            'drop-shadow(0 0 6px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))',
        }}
      >
        {/* Glow outer line */}
        <polyline
          points={pointsString}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="0.22"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        {/* Bright inner line */}
        <polyline
          points={pointsString}
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="0.12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Waypoint glowing nodes */}
        {path.map((p, idx) => (
          <circle
            key={`node-${p.x}-${p.y}-${idx}`}
            cx={p.x + 0.5}
            cy={p.y + 0.5}
            r="0.16"
            fill="#FBBF24"
            stroke="#FFFDF6"
            strokeWidth="0.04"
          />
        ))}
      </svg>
    </div>
  );
}
