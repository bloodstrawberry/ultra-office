import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.corn;

interface CornProps {
  isFrozen?: boolean;
}

export default function Corn({ isFrozen = false }: CornProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Rear Husks / Leaves */}
        <path
          d="M 25 75 C 10 50, 15 35, 30 25 C 25 45, 30 65, 45 85 Z"
          fill={isFrozen ? '#558855' : '#689F38'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 75 75 C 90 50, 85 35, 70 25 C 75 45, 70 65, 55 85 Z"
          fill={isFrozen ? '#558855' : '#689F38'}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Main Corn Cob Body */}
        <path
          d="M 32 40 C 32 20, 40 10, 50 10 C 60 10, 68 20, 68 40 C 68 65, 62 85, 50 85 C 38 85, 32 65, 32 40 Z"
          fill={isFrozen ? '#E6C542' : '#FFD54F'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Kernel Texture Lines */}
        <path
          d="M 40 20 C 40 40, 40 60, 40 78"
          fill="none"
          stroke="#F57F17"
          strokeWidth="2"
          opacity="0.4"
          strokeDasharray="4 3"
        />
        <path
          d="M 50 16 C 50 40, 50 60, 50 82"
          fill="none"
          stroke="#F57F17"
          strokeWidth="2"
          opacity="0.4"
          strokeDasharray="4 3"
        />
        <path
          d="M 60 20 C 60 40, 60 60, 60 78"
          fill="none"
          stroke="#F57F17"
          strokeWidth="2"
          opacity="0.4"
          strokeDasharray="4 3"
        />

        {/* Front Husks / Leaves at Base */}
        <path
          d="M 22 80 C 20 60, 30 45, 42 52 C 32 62, 30 75, 35 88 Z"
          fill={isFrozen ? '#669933' : '#7CB342'}
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 78 80 C 80 60, 70 45, 58 52 C 68 62, 70 75, 65 88 Z"
          fill={isFrozen ? '#77AA44' : '#8BC34A'}
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어붙어 어질어질 빙글빙글 눈 @ @ 🥶 */}
            {/* Shivering Wavy Eyebrows */}
            <path
              d="M 34 46 Q 39 49 44 46"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 56 46 Q 61 49 66 46"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Dizzy Spiral Eyes @ @ */}
            <path
              d="M 43 55 A 4 4 0 0 1 37 55 A 2.5 2.5 0 0 1 41 53 A 1.2 1.2 0 0 1 39 55"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 65 55 A 4 4 0 0 1 59 55 A 2.5 2.5 0 0 1 63 53 A 1.2 1.2 0 0 1 61 55"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <circle cx="32" cy="62" r="4.5" fill="#38BDF8" opacity="0.8" />
            <circle cx="68" cy="62" r="4.5" fill="#38BDF8" opacity="0.8" />

            {/* Shivering Wavy mouth */}
            <path
              d="M 44 65 Q 47 62 50 65 Q 53 68 56 65"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Kawaii Face */}
            <circle cx="41" cy="54" r="4" fill="#221C14" />
            <circle cx="59" cy="54" r="4" fill="#221C14" />
            <circle cx="42.5" cy="52.5" r="1.2" fill="#FFFFFF" />
            <circle cx="60.5" cy="52.5" r="1.2" fill="#FFFFFF" />
            <circle cx="33" cy="58" r="4" fill="#FF8A65" opacity="0.6" />
            <circle cx="67" cy="58" r="4" fill="#FF8A65" opacity="0.6" />
            <path
              d="M 46 60 Q 50 65 54 60"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Highlight */}
        <path
          d="M 37 22 A 15 15 0 0 1 45 14"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
