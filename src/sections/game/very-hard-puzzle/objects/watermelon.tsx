import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.watermelon;

interface WatermelonProps {
  isFrozen?: boolean;
}

export default function Watermelon({ isFrozen = false }: WatermelonProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* 수박 몸통 (껍질) */}
        <circle
          cx="50"
          cy="55"
          r="35"
          fill={isFrozen ? '#3D9443' : '#4CAF50'}
          stroke="#221C14"
          strokeWidth="4"
        />

        {/* 수박 무늬 */}
        <path
          d="M 32 28 Q 28 40 31 52 Q 28 65 33 80"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 41 23 Q 36 35 39 48 Q 36 62 42 75 Q 38 85 41 90"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 59 23 Q 64 35 61 48 Q 64 62 58 75 Q 62 85 59 90"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 68 28 Q 72 40 69 52 Q 72 65 67 80"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 꼭지 */}
        <path
          d="M 50 20 Q 55 10 60 15"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어서 폭풍 눈물 펑펑 쏟아내는 표정 (T_T) 🥶 */}
            {/* Eyes: Streaming waterfall tear lines */}
            <path
              d="M 33 48 L 45 48"
              fill="none"
              stroke="#221C14"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 55 48 L 67 48"
              fill="none"
              stroke="#221C14"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Streaming Icy Tears (폭포수 얼음 눈물) */}
            <path
              d="M 39 48 L 39 68 M 35 52 L 35 64 M 43 52 L 43 62"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 61 48 L 61 68 M 57 52 L 57 62 M 65 52 L 65 64"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle cx="28" cy="65" r="5" fill="#38BDF8" opacity="0.8" />
            <circle cx="72" cy="65" r="5" fill="#38BDF8" opacity="0.8" />

            {/* Big Open Shivering Mouth (T_T) */}
            <path
              d="M 43 64 Q 50 58 57 64 Q 57 74 50 74 Q 43 74 43 64 Z"
              fill="#221C14"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Blue shivering tongue */}
            <path d="M 46 71 Q 50 67 54 71" fill="#7DD3FC" stroke="#221C14" strokeWidth="1.2" />
          </>
        ) : (
          <>
            {/* 3 Sweat Drops 💧💧💧 */}
            <path
              d="M 68 38 C 65 38, 63 42, 68 47 C 73 42, 71 38, 68 38 Z"
              fill="#64B5F6"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <circle cx="69.5" cy="44" r="0.8" fill="#FFFFFF" />

            <path
              d="M 32 38 C 29 38, 27 42, 32 47 C 37 42, 35 38, 32 38 Z"
              fill="#64B5F6"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <circle cx="33.5" cy="44" r="0.8" fill="#FFFFFF" />

            {/* Kawaii Face - Enduring 😣 */}
            <path
              d="M 34 50 L 43 54 L 34 58"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 66 50 L 57 54 L 66 58"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle cx="28" cy="61" r="5" fill="#FF5252" opacity="0.45" />
            <circle cx="72" cy="61" r="5" fill="#FF5252" opacity="0.45" />

            <path
              d="M 43 63 H 57 V 67 H 43 Z"
              fill="#FFFFFF"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <line x1="47.5" y1="63" x2="47.5" y2="67" stroke="#221C14" strokeWidth="1" />
            <line x1="52.5" y1="63" x2="52.5" y2="67" stroke="#221C14" strokeWidth="1" />
          </>
        )}

        {/* 하이라이트 */}
        <path
          d="M 25 45 A 25 25 0 0 1 40 25"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
