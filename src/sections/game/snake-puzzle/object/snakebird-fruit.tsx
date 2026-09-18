'use client';

import type { FruitType } from '../game/snakebird-types';

import React from 'react';

export interface SnakebirdFruitProps {
  type?: FruitType;
  cellSize: number;
}

/**
 * Authentic Snakebird fruit illustrations from reference screenshots.
 */
export const SnakebirdFruit: React.FC<SnakebirdFruitProps> = ({
  type = 'strawberry',
  cellSize,
}) => {
  const cs = cellSize;

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: cs, height: cs }}
    >
      <div
        style={{
          width: cs * 0.82,
          height: cs * 0.82,
        }}
      >
        {getFruitSVG(type)}
      </div>
    </div>
  );
};

function getFruitSVG(type: FruitType): React.ReactNode {
  switch (type) {
    case 'strawberry':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Stem */}
          <path
            d="M 23 8 Q 20 2 16 3"
            stroke="#60D828"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* 3-Point Green Calyx Leaves */}
          <path d="M 24 10 L 16 7 L 19 12 Z" fill="#54C820" />
          <path d="M 24 10 L 32 7 L 29 12 Z" fill="#54C820" />
          <path d="M 24 10 L 24 14 L 21 12 Z" fill="#6EE832" />
          {/* Main Strawberry Body (Smooth heart / teardrop) */}
          <path
            d="M 24 11 C 36 11 38 24 35 34 C 32 44 24 47 24 47 C 24 47 16 44 13 34 C 10 24 12 11 24 11 Z"
            fill="#FF1834"
          />
          {/* Subtle lighter highlight curve */}
          <path
            d="M 18 16 C 14 24 15 32 17 36"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 'pineapple':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Spiky Green Crown Leaves */}
          <polygon points="24,2 18,14 26,14" fill="#4CB818" />
          <polygon points="16,5 14,15 22,14" fill="#68DC2C" />
          <polygon points="32,5 34,15 26,14" fill="#68DC2C" />
          {/* Chubby Orange Pineapple Body */}
          <ellipse cx="24" cy="30" rx="14" ry="16" fill="#FF8C08" />
          <ellipse cx="21" cy="27" rx="10" ry="12" fill="#FFA418" />
        </svg>
      );

    case 'apple':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Stem & Leaf */}
          <path
            d="M 24 10 Q 24 3 28 4"
            stroke="#7A5222"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="29" cy="7" rx="5" ry="3" fill="#6CD824" transform="rotate(25 29 7)" />
          {/* Peach/Apple Coral-Orange Round Body */}
          <ellipse cx="24" cy="28" rx="15" ry="15" fill="#FF7864" />
          <ellipse cx="21" cy="25" rx="10" ry="10" fill="#FF9280" />
        </svg>
      );

    case 'watermelon':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Green Rind */}
          <path d="M 6 32 A 20 20 0 0 1 42 32 Z" fill="#48B818" />
          <path d="M 9 32 A 17 17 0 0 1 39 32 Z" fill="#8CE45A" />
          {/* Red Flesh */}
          <path d="M 12 32 A 14 14 0 0 1 36 32 Z" fill="#FF2438" />
          {/* Seeds */}
          <circle cx="19" cy="26" r="1.4" fill="#111" />
          <circle cx="24" cy="24" r="1.4" fill="#111" />
          <circle cx="29" cy="26" r="1.4" fill="#111" />
        </svg>
      );

    case 'blueberry':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <circle cx="24" cy="27" r="15" fill="#246CE8" />
          <circle cx="21" cy="23" r="10" fill="#4890F8" />
          {/* Star Calyx */}
          <circle cx="24" cy="11" r="2.5" fill="#184CA8" />
          <circle cx="20" cy="13" r="2" fill="#184CA8" />
          <circle cx="28" cy="13" r="2" fill="#184CA8" />
        </svg>
      );

    case 'grape':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <rect x="22" y="3" width="4" height="9" rx="2" fill="#68DC2C" />
          {/* Cluster */}
          <circle cx="18" cy="18" r="6.5" fill="#A830E8" />
          <circle cx="30" cy="18" r="6.5" fill="#9018D0" />
          <circle cx="24" cy="16" r="6.5" fill="#B848F8" />
          <circle cx="16" cy="28" r="6.5" fill="#9018D0" />
          <circle cx="24" cy="26" r="6.5" fill="#A830E8" />
          <circle cx="32" cy="28" r="6.5" fill="#7808B8" />
          <circle cx="24" cy="37" r="6.5" fill="#7808B8" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <ellipse cx="24" cy="28" rx="14" ry="16" fill="#FF1834" />
        </svg>
      );
  }
}
