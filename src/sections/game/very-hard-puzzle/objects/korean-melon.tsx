import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.koreanMelon;

interface KoreanMelonProps {
  isFrozen?: boolean;
}

export default function KoreanMelon({ isFrozen = false }: KoreanMelonProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        <ellipse
          cx="50"
          cy="55"
          rx="28"
          ry="38"
          fill={isFrozen ? '#E6C200' : '#FFD700'}
          stroke="#221C14"
          strokeWidth="4"
        />
        <path
          d="M 38 25 Q 30 55 38 85"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 50 17 L 50 93"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 62 25 Q 70 55 62 85"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어서 이 악물고 덜덜 버티는 표정 (=###=) 🥶 */}
            {/* Horizontal Dash Eyes = = with Eyebrows */}
            <path
              d="M 34 50 L 46 50 M 36 46 L 44 46"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 54 50 L 66 50 M 56 46 L 64 46"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle cx="34" cy="58" r="4.5" fill="#38BDF8" opacity="0.85" />
            <circle cx="66" cy="58" r="4.5" fill="#38BDF8" opacity="0.85" />

            {/* Clenched Teeth Box [###] */}
            <rect
              x="42"
              y="61"
              width="16"
              height="8"
              rx="2"
              fill="#FFFFFF"
              stroke="#221C14"
              strokeWidth="2.5"
            />
            <line x1="46" y1="61" x2="46" y2="69" stroke="#221C14" strokeWidth="1.2" />
            <line x1="50" y1="61" x2="50" y2="69" stroke="#221C14" strokeWidth="1.2" />
            <line x1="54" y1="61" x2="54" y2="69" stroke="#221C14" strokeWidth="1.2" />
            <line x1="42" y1="65" x2="58" y2="65" stroke="#221C14" strokeWidth="1.2" />
          </>
        ) : (
          <>
            {/* Sweat Droplet */}
            <path
              d="M 64 41 C 61 41, 59 45, 64 50 C 69 45, 67 41, 64 41 Z"
              fill="#64B5F6"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <circle cx="65.5" cy="47" r="0.8" fill="#FFFFFF" />

            {/* Hot / Overwhelmed Face */}
            <path
              d="M 37 54 Q 42 58 47 54"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 53 54 Q 58 58 63 54"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="34" cy="60" r="4.5" fill="#FF9900" opacity="0.6" />
            <circle cx="66" cy="60" r="4.5" fill="#FF9900" opacity="0.6" />
            <path
              d="M 45 64 Q 48 61 50 64 Q 52 67 55 64"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}
