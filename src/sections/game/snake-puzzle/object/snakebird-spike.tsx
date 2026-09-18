'use client';

import type { SpikeDirection } from '../game/snakebird-types';

import React from 'react';

export interface SnakebirdSpikeProps {
  direction?: SpikeDirection;
  cellSize: number;
}

/**
 * Authentic Snakebird steel spikes with mounting plate and cross rivets.
 */
export const SnakebirdSpike: React.FC<SnakebirdSpikeProps> = ({ direction = 'up', cellSize }) => {
  const rotation =
    direction === 'down' ? 180 : direction === 'left' ? -90 : direction === 'right' ? 90 : 0;

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: cellSize, height: cellSize }}
    >
      <div style={{ width: '90%', height: '90%', transform: `rotate(${rotation}deg)` }}>
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Base Steel Mounting Bar */}
          <rect x="4" y="34" width="40" height="12" rx="3" fill="#627484" />
          <rect x="6" y="36" width="36" height="8" rx="2" fill="#758899" />

          {/* Cross Screws / Rivets on the mount */}
          <circle cx="10" cy="40" r="2.5" fill="#4B5B69" />
          <line x1="8.5" y1="40" x2="11.5" y2="40" stroke="#8E9EAE" strokeWidth="1" />
          <line x1="10" y1="38.5" x2="10" y2="41.5" stroke="#8E9EAE" strokeWidth="1" />

          <circle cx="38" cy="40" r="2.5" fill="#4B5B69" />
          <line x1="36.5" y1="40" x2="39.5" y2="40" stroke="#8E9EAE" strokeWidth="1" />
          <line x1="38" y1="38.5" x2="38" y2="41.5" stroke="#8E9EAE" strokeWidth="1" />

          {/* 3 Sharp Triangular Steel Teeth */}
          {/* Left Tooth */}
          <polygon points="6,34 14,8 20,34" fill="#889CB0" />
          <polygon points="14,8 20,34 16,34" fill="#6F8396" />

          {/* Center Tooth (Slightly taller) */}
          <polygon points="16,34 24,3 32,34" fill="#9FB4C8" />
          <polygon points="24,3 32,34 27,34" fill="#7D93A8" />

          {/* Right Tooth */}
          <polygon points="28,34 34,8 42,34" fill="#889CB0" />
          <polygon points="34,8 42,34 38,34" fill="#6F8396" />
        </svg>
      </div>
    </div>
  );
};
