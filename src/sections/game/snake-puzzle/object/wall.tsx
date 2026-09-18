import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wall;

export default function Wall() {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full object-contain overflow-visible">
        {/* 1. Outer Dark Frame */}
        <rect x="2" y="2" width="96" height="96" rx="16" fill="#5a3520" />

        {/* 2. Main Wood Body — 이미지처럼 밝은 황금빛 나무 톤 */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="12"
          fill="#DBA55C"
          stroke="#5a3520"
          strokeWidth="3"
        />

        {/* 3. Top-Left Bevel Highlight */}
        <path
          d="M 18 8 L 82 8 C 70 9, 18 12, 10 22 C 8 26, 8 74, 8 82 L 8 18 C 8 12, 12 8, 18 8 Z"
          fill="#F0D9A8"
          opacity="0.5"
        />

        {/* 4. Bottom-Right Bevel Shadow */}
        <path
          d="M 82 92 L 18 92 C 30 92, 82 88, 90 78 C 92 74, 92 26, 92 18 L 92 82 C 92 88, 88 92, 82 92 Z"
          fill="#6B3A1A"
          opacity="0.25"
        />

        {/* --- 5. Plank Grooves (살짝 구불구불하게) --- */}

        {/* Groove 1 */}
        <path
          d="M 6 30 Q 30 29, 50 30.5 Q 72 32, 94 30"
          stroke="#5a3520"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 6.5 31.5 Q 32 30.5, 50 32 Q 70 33, 93.5 31.5"
          stroke="#ECC88A"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* Groove 2 */}
        <path
          d="M 6 50 Q 25 51, 50 49.5 Q 78 48, 94 50"
          stroke="#5a3520"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 6.5 51.5 Q 28 52.5, 50 51 Q 76 49.5, 93.5 51.5"
          stroke="#ECC88A"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* Groove 3 */}
        <path
          d="M 6 70 Q 35 71, 50 70 Q 68 69, 94 70.5"
          stroke="#5a3520"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 6.5 71.5 Q 33 72.5, 50 71.5 Q 70 70.5, 93.5 72"
          stroke="#ECC88A"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* --- 6. Organic Wood Grain (자연스러운 나무결) --- */}

        {/* 첫째 판자 나뭇결 */}
        <path
          d="M 12 14 C 18 13, 22 15.5, 30 14.5 C 38 13, 44 16, 50 15 C 56 14, 62 16.5, 70 15"
          fill="none"
          stroke="#B8803E"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 20 20 C 26 21.5, 34 19, 42 20.5 C 50 22, 58 19.5, 68 21 C 74 22, 80 20, 86 21"
          fill="none"
          stroke="#B8803E"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 14 24 C 22 25, 28 23, 36 24.5 C 42 25.5, 52 23.5, 60 25"
          fill="none"
          stroke="#C49350"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* 둘째 판자 나뭇결 */}
        <path
          d="M 14 36 C 22 37.5, 28 35, 38 36.5 C 48 38, 56 35.5, 66 37 C 72 38, 78 36, 86 37"
          fill="none"
          stroke="#B8803E"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 10 42 C 20 43, 30 41, 40 42.5 C 52 44, 60 41.5, 70 43 C 78 44, 84 42, 90 43"
          fill="none"
          stroke="#C49350"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* 셋째 판자 나뭇결 */}
        <path
          d="M 10 55 C 18 56.5, 26 54, 36 55.5 C 44 57, 54 54.5, 64 56 C 72 57, 80 55, 88 56.5"
          fill="none"
          stroke="#B8803E"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 16 62 C 24 63, 34 61, 44 62.5 C 52 63.5, 60 61.5, 68 63 C 76 64, 82 62, 88 63"
          fill="none"
          stroke="#C49350"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* 넷째 판자 나뭇결 */}
        <path
          d="M 12 76 C 20 77.5, 28 75, 38 76.5 C 46 78, 56 75.5, 66 77 C 74 78, 82 76, 90 77"
          fill="none"
          stroke="#B8803E"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 18 82 C 26 83.5, 36 81, 44 82 C 54 83.5, 62 81, 72 83 C 78 84, 84 82, 88 83"
          fill="none"
          stroke="#C49350"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 14 86 C 22 87, 30 85.5, 40 87 C 48 88, 56 86, 64 87"
          fill="none"
          stroke="#B8803E"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* 나무 매듭 (knot) */}
        <ellipse cx="70" cy="40" rx="4.5" ry="3.5" fill="#A87838" opacity="0.5" />
        <ellipse cx="70" cy="40" rx="2.5" ry="1.8" fill="#96692E" opacity="0.4" />
        <ellipse cx="28" cy="80" rx="3.5" ry="2.5" fill="#A87838" opacity="0.45" />

        {/* Inner subtle highlight border */}
        <rect
          x="7"
          y="7"
          width="86"
          height="86"
          rx="11"
          fill="none"
          stroke="#F0D9A8"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}
