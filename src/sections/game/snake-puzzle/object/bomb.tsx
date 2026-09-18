import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.bomb;

interface BombProps {
  isFrozen?: boolean;
}

export default function Bomb({ isFrozen = false }: BombProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Fuse rope */}
        <path
          d="M 55 28 Q 62 18, 58 12 Q 54 6, 62 4"
          fill="none"
          stroke="#8B7355"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {isFrozen ? (
          /* Frozen Ice Crystal Cap on Fuse */
          <path
            d="M 56 2 L 68 2 L 62 10 Z M 62 -2 L 62 12 M 55 5 L 69 5"
            stroke="#7DD3FC"
            strokeWidth="2"
            fill="#E0F2FE"
          />
        ) : (
          /* Spark / Flame */
          <>
            <path
              d="M 62 4 C 58 -2, 66 -4, 64 2 C 68 -2, 72 2, 66 6 C 70 2, 68 8, 62 4 Z"
              fill="#FF8C00"
              stroke="#FFD700"
              strokeWidth="1"
            />
            <path
              d="M 63 3 C 61 0, 65 -1, 64 2 C 66 0, 67 3, 63 3 Z"
              fill="#FFFF00"
              opacity="0.9"
            />
          </>
        )}

        {/* Main bomb body */}
        <circle
          cx="50"
          cy="58"
          r="32"
          fill={isFrozen ? '#354555' : '#3D3D3D'}
          stroke="#221C14"
          strokeWidth="4"
        />

        {/* Subtle dark gradient overlay */}
        <circle cx="50" cy="58" r="30" fill="#4A4A4A" opacity="0.5" />

        {/* Fuse cap / connector */}
        <rect
          x="44"
          y="25"
          width="12"
          height="8"
          rx="2"
          fill="#6B6B6B"
          stroke="#221C14"
          strokeWidth="3"
        />

        {isFrozen ? (
          <>
            {/* 불꽃이 꺼져 꽁꽁 얼어붙어 극도로 분노한 폭탄 표정 💢🥶 */}
            {/* Angry Frost Blue Eyebrows */}
            <path
              d="M 33 47 L 46 52"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 67 47 L 54 52"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Frost Blue Anger Vein 💢 */}
            <path
              d="M 62 41 L 68 41 M 65 38 L 65 44"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Furious Bulging Frozen Eyes */}
            <circle cx="40" cy="56" r="4.5" fill="#E0F2FE" />
            <circle cx="60" cy="56" r="4.5" fill="#E0F2FE" />
            <circle cx="41" cy="56" r="2.2" fill="#221C14" />
            <circle cx="59" cy="56" r="2.2" fill="#221C14" />

            <circle cx="32" cy="63" r="4.5" fill="#38BDF8" opacity="0.8" />
            <circle cx="68" cy="63" r="4.5" fill="#38BDF8" opacity="0.8" />

            {/* Gritted Angry Shivering Teeth [====] */}
            <rect
              x="42"
              y="64"
              width="16"
              height="7"
              rx="1.5"
              fill="#FFFFFF"
              stroke="#221C14"
              strokeWidth="2.5"
            />
            <line x1="46" y1="64" x2="46" y2="71" stroke="#221C14" strokeWidth="1.2" />
            <line x1="50" y1="64" x2="50" y2="71" stroke="#221C14" strokeWidth="1.2" />
            <line x1="54" y1="64" x2="54" y2="71" stroke="#221C14" strokeWidth="1.2" />
          </>
        ) : (
          <>
            {/* Angry Eyebrows */}
            <path
              d="M 33 48 L 46 53"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 67 48 L 54 53"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Anger Vein Mark */}
            <path
              d="M 62 43 L 68 43 M 65 40 L 65 46"
              fill="none"
              stroke="#FF4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Eyes */}
            <circle cx="40" cy="56" r="4.5" fill="#FFFFFF" />
            <circle cx="60" cy="56" r="4.5" fill="#FFFFFF" />
            <circle cx="42" cy="57" r="2.5" fill="#221C14" />
            <circle cx="58" cy="57" r="2.5" fill="#221C14" />

            {/* Blush */}
            <circle cx="32" cy="62" r="4.5" fill="#FF6B6B" opacity="0.5" />
            <circle cx="68" cy="62" r="4.5" fill="#FF6B6B" opacity="0.5" />

            {/* Mouth - angry frown */}
            <path
              d="M 44 68 Q 50 62 56 68"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Highlight */}
        <path
          d="M 30 45 A 20 20 0 0 1 40 35"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}
