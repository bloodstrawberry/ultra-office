'use client';

import React from 'react';

export interface SnakebirdWallProps {
  cellSize: number;
  hasWallAbove?: boolean;
  hasWallLeft?: boolean;
  hasWallRight?: boolean;
}

/**
 * Authentic Snakebird Tree/Cliff Wall block with lush scalloped lawn and cute blue flowers.
 */
export const SnakebirdWall: React.FC<SnakebirdWallProps> = ({
  cellSize,
  hasWallAbove = false,
  hasWallLeft: _hasWallLeft,
  hasWallRight: _hasWallRight,
}) => {
  const cs = cellSize;

  return (
    <div
      className="relative select-none pointer-events-none"
      style={{
        width: cs,
        height: cs,
        overflow: 'visible',
      }}
    >
      {/* 1. Main Tree / Cliff Wood-Earth Block */}
      <div
        className="w-full h-full relative"
        style={{
          backgroundColor: '#8C5828', // Rich warm tree trunk brown
          borderRadius: hasWallAbove ? '0px' : '6px 6px 0 0',
        }}
      >
        {/* Right/Bottom Shadow for depth */}
        <div
          className="absolute right-0 top-0 bottom-0"
          style={{
            width: '35%',
            backgroundColor: '#704018', // Darker trunk shadow
            opacity: 0.9,
          }}
        />

        {/* Tree Trunk Circular Grain Details */}
        <div
          className="absolute rounded-full"
          style={{
            width: cs * 0.16,
            height: cs * 0.16,
            backgroundColor: '#A46E3A',
            top: '35%',
            left: '20%',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: cs * 0.12,
            height: cs * 0.12,
            backgroundColor: '#5C3412',
            bottom: '20%',
            right: '15%',
            opacity: 0.6,
          }}
        />
      </div>

      {/* 2. Lush Scalloped Grass Surface with Blue Flowers (When Top is Open) */}
      {!hasWallAbove && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: -cs * 0.1,
            right: -cs * 0.1,
            top: -cs * 0.38,
            height: cs * 0.58,
          }}
        >
          {/* Back darker green lawn scallop */}
          <div
            className="absolute rounded-full"
            style={{
              width: cs * 0.55,
              height: cs * 0.44,
              backgroundColor: '#52BD18',
              top: cs * 0.08,
              left: cs * 0.05,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: cs * 0.58,
              height: cs * 0.44,
              backgroundColor: '#52BD18',
              top: cs * 0.08,
              right: cs * 0.05,
            }}
          />

          {/* Front bright lime-green grass bumps */}
          <div
            className="absolute rounded-full"
            style={{
              width: cs * 0.52,
              height: cs * 0.46,
              backgroundColor: '#74E424',
              bottom: 0,
              left: 0,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: cs * 0.62,
              height: cs * 0.54,
              backgroundColor: '#84F228',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: cs * 0.5,
              height: cs * 0.46,
              backgroundColor: '#74E424',
              bottom: 0,
              right: 0,
            }}
          />

          {/* Cute Iconic Blue Flower (🌸) */}
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              top: cs * 0.12,
              right: cs * 0.18,
              width: cs * 0.22,
              height: cs * 0.22,
            }}
          >
            {/* 5 Petals */}
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <circle cx="10" cy="5" r="3.2" fill="#28B2FF" />
              <circle cx="15" cy="8.5" r="3.2" fill="#28B2FF" />
              <circle cx="13" cy="14" r="3.2" fill="#28B2FF" />
              <circle cx="7" cy="14" r="3.2" fill="#28B2FF" />
              <circle cx="5" cy="8.5" r="3.2" fill="#28B2FF" />
              {/* Yellow center */}
              <circle cx="10" cy="10" r="2.4" fill="#FFE218" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
