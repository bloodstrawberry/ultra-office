import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.blueberry;

interface BlueberryProps {
  isFrozen?: boolean;
}

export default function Blueberry({ isFrozen = false }: BlueberryProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <circle
          cx="50"
          cy="55"
          r="35"
          fill={isFrozen ? '#3559CC' : '#4A75FF'}
          stroke="#221C14"
          strokeWidth="4"
        />
        <path
          d="M 40 25 L 45 15 L 50 22 L 55 15 L 60 25 L 50 28 Z"
          fill={isFrozen ? '#55AAEE' : '#3B5ECC'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어서 글썽글썽 울먹이는 아기 블루베리 표정 ( ◕ ︵ ◕ ) 🥶 */}
            {/* Huge Glassy Teary Eyes */}
            <circle cx="38" cy="54" r="5.5" fill="#221C14" />
            <circle cx="40" cy="51.5" r="2.2" fill="#FFFFFF" />
            <circle cx="36" cy="56" r="1.2" fill="#BAE6FD" />

            <circle cx="62" cy="54" r="5.5" fill="#221C14" />
            <circle cx="64" cy="51.5" r="2.2" fill="#FFFFFF" />
            <circle cx="60" cy="56" r="1.2" fill="#BAE6FD" />

            {/* Frost Blue Cheek Blushes */}
            <circle cx="28" cy="62" r="5" fill="#38BDF8" opacity="0.85" />
            <circle cx="72" cy="62" r="5" fill="#38BDF8" opacity="0.85" />

            {/* Trembling Baby Frown ︵ */}
            <path
              d="M 44 67 Q 50 62 56 67"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Ice tear drop hanging on cheek 💧 */}
            <circle cx="42" cy="60" r="1.5" fill="#E0F2FE" />
          </>
        ) : (
          <>
            <circle cx="38" cy="55" r="4.5" fill="#221C14" />
            <circle cx="62" cy="55" r="4.5" fill="#221C14" />
            <circle cx="28" cy="60" r="5" fill="#2A50C2" opacity="0.6" />
            <circle cx="72" cy="60" r="5" fill="#2A50C2" opacity="0.6" />
            <path
              d="M 46 62 Q 50 66 54 62"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        <path
          d="M 25 45 A 20 20 0 0 1 40 25"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
