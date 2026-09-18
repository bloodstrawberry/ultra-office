import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.strawberry;

interface StrawberryProps {
  isFrozen?: boolean;
}

export default function Strawberry({ isFrozen = false }: StrawberryProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* 둥글둥글하고 통통한 딸기 몸통 */}
        <path
          d="M 50 26 C 25 24, 14 42, 18 64 C 22 82, 38 86, 50 86 C 62 86, 78 82, 82 64 C 86 42, 75 24, 50 26 Z"
          fill={isFrozen ? '#E55566' : '#FF3344'}
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* 줄기 & 잎사귀 꼭지 */}
        <path
          d="M 50 26 Q 46 16 52 10"
          fill="none"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 50 26 Q 46 16 52 10"
          fill="none"
          stroke={isFrozen ? '#5BB0C6' : '#7BC62D'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 50 28 C 42 22 30 18 24 27 C 32 30 38 29 43 28 C 44 21 49 14 54 21 C 58 28 62 30 76 27 C 70 18 58 22 50 28 Z"
          fill={isFrozen ? '#78D5E6' : '#84D136'}
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 귀여운 노란 씨앗 (둥근 타원형) */}
        <ellipse cx="34" cy="40" rx="1.8" ry="2.8" transform="rotate(-15 34 40)" fill="#FFE666" />
        <ellipse cx="66" cy="40" rx="1.8" ry="2.8" transform="rotate(15 66 40)" fill="#FFE666" />
        <ellipse cx="50" cy="35" rx="1.8" ry="2.8" fill="#FFE666" />
        <ellipse cx="26" cy="54" rx="1.8" ry="2.8" transform="rotate(-20 26 54)" fill="#FFE666" />
        <ellipse cx="74" cy="54" rx="1.8" ry="2.8" transform="rotate(20 74 54)" fill="#FFE666" />
        <ellipse cx="38" cy="72" rx="1.8" ry="2.8" transform="rotate(-10 38 72)" fill="#FFE666" />
        <ellipse cx="62" cy="72" rx="1.8" ry="2.8" transform="rotate(10 62 72)" fill="#FFE666" />
        <ellipse cx="50" cy="78" rx="1.8" ry="2.8" fill="#FFE666" />

        {isFrozen ? (
          <>
            {/* 꽁꽁 얼어 추워서 눈물 찔끔 흘리며 덜덜 떠는 표정 🥶 */}
            {/* 눈: 질끈 감은 > < */}
            <path
              d="M 33 49 L 41 53 L 33 57"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 67 49 L 59 53 L 67 57"
              fill="none"
              stroke="#221C14"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 얼어붙은 눈물 방울 💧 */}
            <circle cx="28" cy="52" r="2.2" fill="#BAE6FD" stroke="#221C14" strokeWidth="1" />
            <circle cx="72" cy="52" r="2.2" fill="#BAE6FD" stroke="#221C14" strokeWidth="1" />

            {/* 서리/얼음 볼터치 */}
            <circle cx="28" cy="60" r="5" fill="#38BDF8" opacity="0.8" />
            <circle cx="72" cy="60" r="5" fill="#38BDF8" opacity="0.8" />

            {/* 이빨 딱딱 떨리는 입 vvv */}
            <path
              d="M 43 62 L 46 58 L 49 62 L 52 58 L 55 62 L 58 58"
              fill="none"
              stroke="#221C14"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 딸기 끝에 맺힌 작은 고드름 */}
            <path
              d="M 48 86 L 50 94 L 52 86 Z"
              fill="#E0F2FE"
              stroke="#221C14"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            {/* 똘망똘망한 눈 (눈반짝 포함) */}
            <circle cx="38" cy="53" r="4.5" fill="#221C14" />
            <circle cx="39.5" cy="51.5" r="1.6" fill="#FFFFFF" />

            <circle cx="62" cy="53" r="4.5" fill="#221C14" />
            <circle cx="63.5" cy="51.5" r="1.6" fill="#FFFFFF" />

            {/* 발그레 볼터치 */}
            <circle cx="28" cy="58" r="5.5" fill="#FF5577" opacity="0.5" />
            <circle cx="72" cy="58" r="5.5" fill="#FF5577" opacity="0.5" />

            {/* 미소 입 */}
            <path
              d="M 45 57 Q 50 63 55 57"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* 하이라이트 광택 */}
        <path
          d="M 26 36 A 22 22 0 0 1 38 28"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="24" cy="42" r="2" fill="#FFFFFF" opacity="0.5" />
      </svg>
    </div>
  );
}
