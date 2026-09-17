import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallV;

interface WallVProps {
  isFrozen?: boolean;
}

export default function WallV({ isFrozen = false }: WallVProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Main vertical plank body */}
        <rect
          x="18"
          y="2"
          width="64"
          height="96"
          rx="12"
          fill={isFrozen ? '#A67C52' : '#C4873B'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Left bevel highlight */}
        <path
          d="M 20 12 L 20 88 C 21 80, 24 14, 20 12 Z"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          opacity="0.6"
        />

        {/* Right shadow */}
        <path d="M 80 12 L 80 88 C 79 80, 77 14, 80 12 Z" fill="#5C3B1E" opacity="0.35" />

        {/* Wood grain lines - vertical */}
        <path
          d="M 32 8 Q 31 30, 32.5 50 Q 34 72, 32 92"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1.2"
          opacity="0.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 8 Q 44 35, 42.5 50 Q 41 68, 43 92"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1"
          opacity="0.4"
          strokeLinecap="round"
        />
        <path
          d="M 57 8 Q 56 35, 57.5 50 Q 59 68, 57 92"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1"
          opacity="0.4"
          strokeLinecap="round"
        />
        <path
          d="M 68 8 Q 69 28, 68 50 Q 67 75, 69 92"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1.2"
          opacity="0.45"
          strokeLinecap="round"
        />

        {/* Wood knot */}
        <ellipse
          cx="40"
          cy="78"
          rx="3"
          ry="3.5"
          fill={isFrozen ? '#704822' : '#96692E'}
          opacity="0.5"
        />

        {/* Top triangle arrow */}
        <polygon
          points="50,8 40,18 60,18"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Bottom triangle arrow */}
        <polygon
          points="50,92 40,82 60,82"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Vine / leaf decoration */}
        <path
          d="M 18 40 C 12 35, 8 42, 14 44"
          fill={isFrozen ? '#5BB0C6' : '#7CB342'}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 18 46 C 10 48, 12 54, 16 50"
          fill={isFrozen ? '#78D5E6' : '#8BC34A'}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {isFrozen ? (
          <>
            {/* Frozen Cold Face - Dazed & Shivering 🥶 */}
            {/* Shivering Eyebrows */}
            <path
              d="M 37 40 L 46 43"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 63 40 L 54 43"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Squeezed Shut Eyes > < */}
            <path
              d="M 38 46 L 45 49 L 38 52"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 62 46 L 55 49 L 62 52"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frosty Blue Blush */}
            <circle cx="32" cy="54" r="4.5" fill="#38BDF8" opacity="0.75" />
            <circle cx="68" cy="54" r="4.5" fill="#38BDF8" opacity="0.75" />

            {/* Teeth Chattering Mouth vvv */}
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
              d="M 50 36 C 48 36, 46 39, 50 43 C 54 39, 52 36, 50 36 Z"
              fill="#93C5FD"
              stroke="#221C14"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <>
            {/* Kawaii Face - Looking Up 🙄 */}
            {/* Eye bases */}
            <circle cx="42" cy="46" r="4.5" fill="#FFFFFF" stroke="#221C14" strokeWidth="2" />
            <circle cx="58" cy="46" r="4.5" fill="#FFFFFF" stroke="#221C14" strokeWidth="2" />
            {/* Pupils shifted upwards */}
            <circle cx="42" cy="43.5" r="2.2" fill="#221C14" />
            <circle cx="58" cy="43.5" r="2.2" fill="#221C14" />
            <circle cx="43" cy="42.5" r="0.8" fill="#FFFFFF" />
            <circle cx="59" cy="42.5" r="0.8" fill="#FFFFFF" />

            {/* Blush */}
            <circle cx="33" cy="52" r="4.5" fill="#E8A87C" opacity="0.5" />
            <circle cx="67" cy="52" r="4.5" fill="#E8A87C" opacity="0.5" />

            {/* Mouth - curious small open mouth */}
            <ellipse cx="50" cy="55" rx="3" ry="3.5" fill="#221C14" />
          </>
        )}

        {/* Highlight */}
        <path
          d="M 26 14 A 15 30 0 0 1 22 30"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
