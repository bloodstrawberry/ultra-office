import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.sweetPotato;

interface SweetPotatoProps {
  isFrozen?: boolean;
}

export default function SweetPotato({ isFrozen = false }: SweetPotatoProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <path
          d="M 20 60 C 15 40, 30 20, 50 25 C 70 30, 85 45, 80 65 C 75 85, 55 90, 40 85 C 25 80, 25 80, 20 60 Z"
          fill={isFrozen ? '#885577' : '#993366'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
          transform="rotate(-15 50 50)"
        />
        <path
          d="M 35 40 Q 40 42 38 45"
          fill="none"
          stroke="#662244"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 65 70 Q 70 72 68 75"
          fill="none"
          stroke="#662244"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 70 45 Q 73 47 71 50"
          fill="none"
          stroke="#662244"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {isFrozen ? (
          <>
            {/* 따끈따끈해야 할 군고구마가 꽁꽁 얼어서 경악한 표정 (o_o) 🥶 */}
            {/* Shocked Frozen Round Eyes */}
            <circle cx="39" cy="52" r="5" fill="#221C14" />
            <circle cx="40.5" cy="50.5" r="1.5" fill="#FFFFFF" />
            <circle cx="61" cy="52" r="5" fill="#221C14" />
            <circle cx="62.5" cy="50.5" r="1.5" fill="#FFFFFF" />

            {/* Icy Cyan Cold Blush */}
            <ellipse cx="31" cy="61" rx="6" ry="4.5" fill="#38BDF8" opacity="0.8" />
            <ellipse cx="69" cy="61" rx="6" ry="4.5" fill="#38BDF8" opacity="0.8" />

            {/* Shivering Tiny 'O' Mouth blowing cold vapor breath */}
            <ellipse cx="50" cy="64" rx="3" ry="4" fill="#221C14" />
            {/* Frosty puff cloud coming out of mouth 💨 */}
            <path
              d="M 54 62 C 58 59, 64 61, 65 65 C 67 63, 72 65, 70 69"
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Frozen steam turned into icicles on top ❄️ */}
            <path
              d="M 45 25 L 43 14 L 47 20 M 55 27 L 57 16 L 53 22"
              stroke="#7DD3FC"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Shy Blushing Face 😳 */}
            {/* Shy eyes looking slightly down */}
            <circle cx="41" cy="54" r="4" fill="#221C14" />
            <circle cx="42.2" cy="52.8" r="1.3" fill="#FFFFFF" />
            <circle cx="59" cy="54" r="4" fill="#221C14" />
            <circle cx="60.2" cy="52.8" r="1.3" fill="#FFFFFF" />

            {/* Big Soft Blushing Cheeks */}
            <ellipse cx="32" cy="59" rx="6" ry="4.5" fill="#FF5588" opacity="0.65" />
            <ellipse cx="68" cy="59" rx="6" ry="4.5" fill="#FF5588" opacity="0.65" />
            {/* Blush Slant Lines /// */}
            <path
              d="M 30 58 L 32 61 M 33 58 L 35 61"
              stroke="#FF2E63"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 65 58 L 67 61 M 68 58 L 70 61"
              stroke="#FF2E63"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Shy Wavy Smile */}
            <path
              d="M 46 62 Q 50 59 54 62"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
        <path
          d="M 30 45 A 25 25 0 0 1 45 32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
