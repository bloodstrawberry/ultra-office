import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallAutoH;

interface WallAutoHProps {
  isFrozen?: boolean;
}

function WallAutoH({ isFrozen = false }: WallAutoHProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Main cloud body - fluffy shape (big) */}
        <path
          d="M 18 22
             C 18 10, 34 4, 50 10
             C 66 4, 82 10, 82 22
             C 92 20, 98 30, 94 40
             C 98 48, 96 60, 86 64
             C 90 74, 80 82, 68 78
             C 62 86, 38 86, 32 78
             C 20 82, 10 74, 14 64
             C 4 60, 2 48, 6 40
             C 2 30, 8 20, 18 22 Z"
          fill={isFrozen ? '#A5D8F5' : '#B8E4FF'}
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Cloud inner highlight - lighter puff */}
        <path
          d="M 24 28
             C 24 16, 38 12, 50 16
             C 62 12, 76 16, 76 28
             C 84 26, 90 34, 86 42"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Inner cloud shading */}
        <path
          d="M 14 58
             C 10 52, 8 42, 14 36"
          fill="none"
          stroke={isFrozen ? '#6DBBE8' : '#8ECFFF'}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 86 58
             C 90 52, 92 42, 86 36"
          fill="none"
          stroke={isFrozen ? '#6DBBE8' : '#8ECFFF'}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />

        {isFrozen ? (
          <>
            {/* Frozen Cold -_- Face 🥶 */}
            {/* Shivering Wobbly Flat Eyes */}
            <path
              d="M 32 46 L 36 44 L 40 47 L 44 45"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 56 45 L 60 47 L 64 44 L 68 46"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frost Blue Blush */}
            <circle cx="28" cy="54" r="5.5" fill="#38BDF8" opacity="0.8" />
            <circle cx="72" cy="54" r="5.5" fill="#38BDF8" opacity="0.8" />

            {/* Shivering Teeth Chattering Mouth vvv */}
            <path
              d="M 43 57 L 46 53 L 49 57 L 52 53 L 55 57 L 58 53"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cold Sweat Droplet 💧 */}
            <path
              d="M 22 36 C 20 36, 18 39, 22 43 C 26 39, 24 36, 22 36 Z"
              fill="#93C5FD"
              stroke="#221C14"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <>
            {/* -_- Face */}
            {/* Flat line eyes */}
            <path
              d="M 32 46 L 44 46"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 56 46 L 68 46"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Blush */}
            <circle cx="28" cy="54" r="5.5" fill="#FF9999" opacity="0.5" />
            <circle cx="72" cy="54" r="5.5" fill="#FF9999" opacity="0.5" />

            {/* Flat line mouth */}
            <path
              d="M 44 56 L 56 56"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Top highlight */}
        <path
          d="M 28 18 A 16 16 0 0 1 42 12"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export default React.memo(WallAutoH);
