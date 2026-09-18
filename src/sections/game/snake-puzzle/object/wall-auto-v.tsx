import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallAutoV;

interface WallAutoVProps {
  isFrozen?: boolean;
}

function WallAutoV({ isFrozen = false }: WallAutoVProps) {
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
            {/* Frozen Sleepy Cold Face 🥶 */}
            {/* Cold snowflake symbols ❄️ */}
            <path
              d="M 76 30 L 76 38 M 72 34 L 80 34 M 73 31 L 79 37 M 79 31 L 73 37"
              stroke="#0284C7"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 84 22 L 84 28 M 81 25 L 87 25"
              stroke="#0284C7"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Squeezed Shut Shivering Eyes > < */}
            <path
              d="M 33 44 L 40 48 L 33 52"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 67 44 L 60 48 L 67 52"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frosty Blue Blush */}
            <circle cx="28" cy="55" r="6" fill="#38BDF8" opacity="0.8" />
            <circle cx="72" cy="55" r="6" fill="#38BDF8" opacity="0.8" />

            {/* Teeth Chattering Mouth vvv */}
            <path
              d="M 43 58 L 46 54 L 49 58 L 52 54 L 55 58 L 58 54"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frozen solid icicle drop hanging */}
            <path
              d="M 54 58 L 57 68 L 60 58 Z"
              fill="#E0F7FA"
              stroke="#221C14"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            {/* Sleepy Face */}
            {/* Floating zZ */}
            <text x="71" y="38" fontSize="10" fontWeight="bold" fill="#221C14" opacity="0.8">
              z
            </text>
            <text x="78" y="30" fontSize="13" fontWeight="bold" fill="#221C14" opacity="0.8">
              Z
            </text>

            {/* Sleepy eyes - downward droopy curves */}
            <path
              d="M 33 44 Q 39 50 45 44"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 55 44 Q 61 50 67 44"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Blush */}
            <circle cx="28" cy="55" r="6" fill="#FF9999" opacity="0.55" />
            <circle cx="72" cy="55" r="6" fill="#FF9999" opacity="0.55" />

            {/* Mouth - sleepy open 'o' */}
            <ellipse cx="50" cy="57" rx="3" ry="3.5" fill="#221C14" />
            {/* Cute snot bubble */}
            <circle
              cx="54"
              cy="58"
              r="3.5"
              fill="#E0F7FA"
              stroke="#221C14"
              strokeWidth="1.5"
              opacity="0.85"
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

export default React.memo(WallAutoV);
