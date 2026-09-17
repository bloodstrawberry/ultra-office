import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.grape;

interface GrapeProps {
  isFrozen?: boolean;
}

export default function Grape({ isFrozen = false }: GrapeProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <path
          d="M 50 10 Q 55 20 50 25"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 50 25 C 25 15, 20 40, 45 35 Z"
          fill={isFrozen ? '#66B088' : '#84D136'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 50 25 C 75 15, 80 40, 55 35 Z"
          fill={isFrozen ? '#66B088' : '#84D136'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle
          cx="35"
          cy="45"
          r="12"
          fill={isFrozen ? '#7A3BC0' : '#9B51E0'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <circle
          cx="65"
          cy="45"
          r="12"
          fill={isFrozen ? '#7A3BC0' : '#9B51E0'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <circle
          cx="30"
          cy="65"
          r="12"
          fill={isFrozen ? '#7A3BC0' : '#9B51E0'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <circle
          cx="70"
          cy="65"
          r="12"
          fill={isFrozen ? '#7A3BC0' : '#9B51E0'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="80"
          r="12"
          fill={isFrozen ? '#7A3BC0' : '#9B51E0'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <circle
          cx="50"
          cy="55"
          r="18"
          fill={isFrozen ? '#904AD0' : '#B266FF'}
          stroke="#221C14"
          strokeWidth="3"
        />
        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어서 기절 직전 X X 눈에 혓바닥 쏙 내민 표정 (X 👅 X) 🥶 */}
            {/* Left Eye: X */}
            <path
              d="M 37 49 L 45 57 M 45 49 L 37 57"
              stroke="#221C14"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Right Eye: X */}
            <path
              d="M 55 49 L 63 57 M 63 49 L 55 57"
              stroke="#221C14"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            <circle cx="36" cy="61" r="3.5" fill="#38BDF8" opacity="0.85" />
            <circle cx="64" cy="61" r="3.5" fill="#38BDF8" opacity="0.85" />

            {/* Mouth with blue frozen tongue 👅 */}
            <path d="M 44 60 C 44 67, 56 67, 56 60 Z" fill="#221C14" />
            <path d="M 47 64 C 47 62, 53 62, 53 64 C 53 67, 47 67, 47 64 Z" fill="#7DD3FC" />
          </>
        ) : (
          <>
            {/* Left eye > */}
            <path
              d="M 39 49 L 46 53 L 39 57"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right eye < */}
            <path
              d="M 61 49 L 54 53 L 61 57"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="37" cy="58" r="3.5" fill="#8B3BC7" opacity="0.8" />
            <circle cx="63" cy="58" r="3.5" fill="#8B3BC7" opacity="0.8" />
            <path d="M 44 59 C 44 66, 56 66, 56 59 Z" fill="#221C14" />
            <path d="M 47 63 C 47 61, 53 61, 53 63 C 53 65.5, 47 65.5, 47 63 Z" fill="#FF6688" />
          </>
        )}
      </svg>
    </div>
  );
}
