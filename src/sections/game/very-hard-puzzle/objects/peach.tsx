import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.peach;

interface PeachProps {
  isFrozen?: boolean;
}

export default function Peach({ isFrozen = false }: PeachProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <path
          d="M 50 20 C 30 5, 20 30, 45 35 Z"
          fill={isFrozen ? '#66B088' : '#84D136'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 50 25 C 20 15, 10 60, 30 80 C 40 90, 50 85, 50 85 C 50 85, 60 90, 70 80 C 90 60, 80 15, 50 25 Z"
          fill={isFrozen ? '#E57799' : '#FF99B3'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 50 25 Q 45 40 50 50"
          fill="none"
          stroke="#FF6688"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {isFrozen ? (
          <>
            {/* 사랑스러운 하트 눈이 꽁꽁 얼어 금이 가버린 표정 (💔_💔) 🥶 */}
            {/* Frozen Cracked Heart Eyes */}
            <path
              d="M 38 56 C 34 50, 28 56, 38 64 C 48 56, 42 50, 38 56 Z"
              fill="#93C5FD"
              stroke="#221C14"
              strokeWidth="2"
            />
            {/* Crack on Left Heart */}
            <path d="M 35 53 L 39 58 L 36 62" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />

            <path
              d="M 62 56 C 58 50, 52 56, 62 64 C 72 56, 66 50, 62 56 Z"
              fill="#93C5FD"
              stroke="#221C14"
              strokeWidth="2"
            />
            {/* Crack on Right Heart */}
            <path d="M 65 53 L 61 58 L 64 62" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />

            <circle cx="28" cy="65" r="5" fill="#38BDF8" opacity="0.85" />
            <circle cx="72" cy="65" r="5" fill="#38BDF8" opacity="0.85" />

            {/* Shivering Inverted Pout Mouth ^ */}
            <path
              d="M 44 71 Q 50 64 56 71"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Chattering teeth line inside mouth */}
            <path
              d="M 47 70 L 49 68 L 51 70 L 53 68"
              fill="none"
              stroke="#221C14"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Heart Eyes */}
            <path
              d="M 38 56 C 34 50, 28 56, 38 64 C 48 56, 42 50, 38 56 Z"
              fill="#FF2E63"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <path
              d="M 62 56 C 58 50, 52 56, 62 64 C 72 56, 66 50, 62 56 Z"
              fill="#FF2E63"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <circle cx="28" cy="65" r="5" fill="#FF4D6D" opacity="0.6" />
            <circle cx="72" cy="65" r="5" fill="#FF4D6D" opacity="0.6" />
            <path
              d="M 45 66 Q 50 73 55 66"
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
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
