import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallH;

interface WallHProps {
  isFrozen?: boolean;
}

export default function WallH({ isFrozen = false }: WallHProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Main horizontal plank body - shifted up */}
        <rect
          x="2"
          y="18"
          width="96"
          height="44"
          rx="10"
          fill={isFrozen ? '#A67C52' : '#C4873B'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Top bevel highlight */}
        <path
          d="M 12 20 L 88 20 C 80 21, 14 23, 12 20 Z"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          opacity="0.6"
        />

        {/* Bottom shadow */}
        <path d="M 12 60 L 88 60 C 80 59, 14 57, 12 60 Z" fill="#5C3B1E" opacity="0.35" />

        {/* Wood grain lines - horizontal */}
        <path
          d="M 8 30 Q 30 29, 50 30.5 Q 72 32, 92 30"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1.2"
          opacity="0.5"
          strokeLinecap="round"
        />
        <path
          d="M 8 40 Q 35 41, 50 39.5 Q 68 38, 92 40"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1"
          opacity="0.4"
          strokeLinecap="round"
        />
        <path
          d="M 8 48 Q 28 49, 50 48 Q 75 47, 92 49"
          fill="none"
          stroke={isFrozen ? '#7A532C' : '#A06B2E'}
          strokeWidth="1.2"
          opacity="0.45"
          strokeLinecap="round"
        />

        {/* Wood knot */}
        <ellipse
          cx="78"
          cy="35"
          rx="3.5"
          ry="2.5"
          fill={isFrozen ? '#704822' : '#96692E'}
          opacity="0.5"
        />

        {/* Left triangle arrow */}
        <polygon
          points="8,40 18,30 18,50"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Right triangle arrow */}
        <polygon
          points="92,40 82,30 82,50"
          fill={isFrozen ? '#CBE8F5' : '#E8C88A'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Vine / leaf decoration */}
        <path
          d="M 35 18 C 30 12, 38 8, 40 14"
          fill={isFrozen ? '#5BB0C6' : '#7CB342'}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 40 18 C 42 10, 48 12, 44 16"
          fill={isFrozen ? '#78D5E6' : '#8BC34A'}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {isFrozen ? (
          <>
            {/* Frozen Cold Face - Shivering & Pleading 🥶 */}
            {/* Shivering Eyebrows */}
            <path
              d="M 38 30 L 46 33"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 62 30 L 54 33"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Squeezed Shut Eyes > < */}
            <path
              d="M 39 37 L 46 40 L 39 43"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 61 37 L 54 40 L 61 43"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Frosty Blue Blush */}
            <circle cx="34" cy="44" r="4.5" fill="#38BDF8" opacity="0.75" />
            <circle cx="66" cy="44" r="4.5" fill="#38BDF8" opacity="0.75" />

            {/* Chattering Teeth Zig-Zag Mouth vvv */}
            <path
              d="M 44 47 L 47 43 L 50 47 L 53 43 L 56 47"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cold Sweat Droplet 💧 */}
            <path
              d="M 28 32 C 26 32, 24 35, 28 39 C 32 35, 30 32, 28 32 Z"
              fill="#93C5FD"
              stroke="#221C14"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <>
            {/* Kawaii Face - Pleading Teary-Eyed 🥺 */}
            {/* Pleading Eyebrows */}
            <path
              d="M 39 31 L 47 30"
              fill="none"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 61 30 L 53 31"
              fill="none"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Big Sparkling Eyes */}
            <circle cx="44" cy="37" r="5" fill="#221C14" />
            <circle cx="42.5" cy="35" r="2" fill="#FFFFFF" />
            <circle cx="46" cy="39" r="1" fill="#FFFFFF" />
            <circle cx="40" cy="41" r="1.3" fill="#64B5F6" opacity="0.95" />

            <circle cx="60" cy="37" r="5" fill="#221C14" />
            <circle cx="58.5" cy="35" r="2" fill="#FFFFFF" />
            <circle cx="62" cy="39" r="1" fill="#FFFFFF" />
            <circle cx="56" cy="41" r="1.3" fill="#64B5F6" opacity="0.95" />

            {/* Blush */}
            <circle cx="34" cy="43" r="4" fill="#E8A87C" opacity="0.5" />
            <circle cx="66" cy="43" r="4" fill="#E8A87C" opacity="0.5" />

            {/* Sad / Pouty Mouth */}
            <path
              d="M 46 45 Q 50 41 54 45"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Highlight */}
        <path
          d="M 15 24 A 30 15 0 0 1 30 20"
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
