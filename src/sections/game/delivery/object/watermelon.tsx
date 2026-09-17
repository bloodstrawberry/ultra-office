import React from "react";
import { OBJECT_SCALES } from "./constants";

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
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 그림자 */}
        <ellipse cx="50" cy="88" rx="36" ry="7" fill="#0f172a" opacity="0.2" />

        {/* 골판지 박스 몸통 */}
        <rect
          x="12"
          y="18"
          width="76"
          height="68"
          rx="8"
          fill={isFrozen ? "#93c5fd" : "#d97706"}
          stroke="#78350f"
          strokeWidth="3.5"
        />

        {/* 골판지 질감 / 안쪽 쉐이드 */}
        <rect
          x="16"
          y="22"
          width="68"
          height="60"
          rx="6"
          fill={isFrozen ? "#bfdbfe" : "#f59e0b"}
        />

        {/* 박스 상단 덮개 라인 */}
        <path
          d="M 12 42 L 88 42"
          stroke="#78350f"
          strokeWidth="2.5"
        />

        {/* 십자 포장 테이프 (가로 / 세로 테이프) */}
        <rect
          x="44"
          y="18"
          width="12"
          height="68"
          fill={isFrozen ? "#e0f2fe" : "#fbbf24"}
          stroke="#d97706"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <rect
          x="12"
          y="48"
          width="76"
          height="10"
          fill={isFrozen ? "#e0f2fe" : "#fbbf24"}
          stroke="#d97706"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* 취급주의 / 파손주의 FRAGILE 와인잔 아이콘 (우측 상단 라벨) */}
        <g transform="translate(62, 24)">
          <rect
            x="0"
            y="0"
            width="18"
            height="18"
            rx="3"
            fill="#ef4444"
            stroke="#991b1b"
            strokeWidth="1.5"
          />
          {/* 와인잔 (FRAGILE) */}
          <path
            d="M 5 4 L 13 4 L 11 9 C 10 11 8 11 7 9 Z"
            fill="#ffffff"
          />
          <line x1="9" y1="10" x2="9" y2="14" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="6" y1="14" x2="12" y2="14" stroke="#ffffff" strokeWidth="1.5" />
        </g>

        {/* 배송 송장 바코드 라벨 (좌측 하단) */}
        <g transform="translate(18, 62)">
          <rect
            x="0"
            y="0"
            width="22"
            height="18"
            rx="2"
            fill="#ffffff"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          {/* 바코드 라인들 */}
          <line x1="3" y1="4" x2="3" y2="12" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="6" y1="4" x2="6" y2="12" stroke="#0f172a" strokeWidth="1" />
          <line x1="9" y1="4" x2="9" y2="12" stroke="#0f172a" strokeWidth="2" />
          <line x1="13" y1="4" x2="13" y2="12" stroke="#0f172a" strokeWidth="1" />
          <line x1="16" y1="4" x2="16" y2="12" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="19" y1="4" x2="19" y2="12" stroke="#0f172a" strokeWidth="1" />
        </g>

        {/* 상자 귀여운 표정 (부딪히면 부서지는 연약한 상자 🥺) */}
        {!isFrozen ? (
          <g>
            <circle cx="34" cy="34" r="2.5" fill="#78350f" />
            <circle cx="35" cy="33.5" r="0.8" fill="#ffffff" />
            <path
              d="M 31 38 Q 34 40 37 38"
              fill="none"
              stroke="#78350f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g>
            <path
              d="M 31 33 L 37 35 M 31 35 L 37 33"
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
