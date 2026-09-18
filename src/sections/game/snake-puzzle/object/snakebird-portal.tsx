'use client';

import React from 'react';

export interface SnakebirdPortalProps {
  isOpen: boolean;
  cellSize: number;
}

/**
 * Authentic Snakebird Rainbow Swirl Vortex Portal with orbiting spark particles.
 */
export const SnakebirdPortal: React.FC<SnakebirdPortalProps> = ({ isOpen, cellSize }) => {
  const cs = cellSize;

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none"
      style={{ width: cs, height: cs }}
    >
      {isOpen ? (
        <>
          {/* Swirling Rainbow Vortex Pinwheel */}
          <div
            className="relative flex items-center justify-center animate-spin-slow"
            style={{
              width: cs * 0.92,
              height: cs * 0.92,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
              {/* Rainbow Swirl Petals */}
              <path d="M 50 50 Q 75 25 85 50 Q 65 65 50 50" fill="#FF3050" />
              <path d="M 50 50 Q 75 75 50 85 Q 35 65 50 50" fill="#FF8818" />
              <path d="M 50 50 Q 25 75 15 50 Q 35 35 50 50" fill="#FFE018" />
              <path d="M 50 50 Q 25 25 50 15 Q 65 35 50 50" fill="#38D840" />
              <path d="M 50 50 Q 60 15 75 20 Q 65 45 50 50" fill="#18B8FF" />
              <path d="M 50 50 Q 85 60 80 75 Q 55 65 50 50" fill="#9840FF" />
              <path d="M 50 50 Q 40 85 25 80 Q 35 55 50 50" fill="#FF3090" />

              {/* Glowing Core */}
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <circle cx="50" cy="50" r="8" fill="#FFF275" />
            </svg>
          </div>

          {/* Floating colorful spark particles */}
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: cs * 0.12,
              height: cs * 0.12,
              backgroundColor: '#FFE018',
              top: cs * 0.05,
              right: cs * 0.1,
            }}
          />
          <div
            className="absolute rounded-full animate-bounce"
            style={{
              width: cs * 0.1,
              height: cs * 0.1,
              backgroundColor: '#18B8FF',
              bottom: cs * 0.08,
              left: cs * 0.1,
            }}
          />
        </>
      ) : (
        /* Inactive Sleep / Closed Portal */
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: cs * 0.75,
            height: cs * 0.75,
            backgroundColor: '#4B5563',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: cs * 0.44,
              height: cs * 0.44,
              backgroundColor: '#374151',
            }}
          >
            <span style={{ fontSize: cs * 0.18, lineHeight: 1, opacity: 0.6 }}>🔒</span>
          </div>
        </div>
      )}
    </div>
  );
};
