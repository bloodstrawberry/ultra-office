import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.apple;

interface AppleProps {
  isFrozen?: boolean;
}

export default function Apple({ isFrozen = false }: AppleProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <path
          d="M 50 25 C 30 5, 20 25, 45 30 Z"
          fill={isFrozen ? '#66B088' : '#84D136'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 50 25 C 70 5, 80 25, 55 30 Z"
          fill={isFrozen ? '#66B088' : '#84D136'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 50 25 C 20 15, 10 50, 20 75 C 30 95, 45 90, 50 85 C 55 90, 70 95, 80 75 C 90 50, 80 15, 50 25 Z"
          fill={isFrozen ? '#E55555' : '#FF4444'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 50 10 Q 45 20, 50 25"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어서 한쪽 눈 찡그리고 입술 파르르 삐죽 내민 표정 (> 3) 🥶 */}
            {/* Left Eye: Squeezed shut > */}
            <path
              d="M 33 51 L 41 55 L 33 59"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Eye: Trembling small dot with shivering eyebrow */}
            <circle cx="62" cy="55" r="3.5" fill="#221C14" />
            <circle cx="63.5" cy="53.5" r="1.2" fill="#FFFFFF" />
            <path
              d="M 57 48 Q 62 46 67 49"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <circle cx="28" cy="61" r="5" fill="#38BDF8" opacity="0.8" />
            <circle cx="72" cy="61" r="5" fill="#38BDF8" opacity="0.8" />

            {/* Puckered shivering lips (3) */}
            <path
              d="M 52 61 Q 48 64 52 67 Q 48 70 52 73"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Tiny ice star glint ❄️ */}
            <path
              d="M 43 65 L 43 71 M 40 68 L 46 68"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="38" cy="55" r="4.5" fill="#221C14" />
            <circle cx="39.5" cy="53.5" r="1.5" fill="#FFFFFF" />
            <path
              d="M 56 55 Q 62 49 68 55"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="28" cy="60" r="5" fill="#FF8888" opacity="0.7" />
            <circle cx="72" cy="60" r="5" fill="#FF8888" opacity="0.7" />
            <path
              d="M 45 62 Q 50 68 55 62"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        <path
          d="M 25 45 A 15 15 0 0 1 35 30"
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
