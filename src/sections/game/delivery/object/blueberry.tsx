import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.blueberry;

interface BlueberryProps {
  isFrozen?: boolean;
}

export default function Blueberry({ isFrozen = false }: BlueberryProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none animate-bounce"
      style={{ transform: `scale(${SCALE})`, animationDuration: "2.5s" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 그림자 */}
        <ellipse cx="50" cy="86" rx="28" ry="6" fill="#0f172a" opacity="0.2" />

        {/* 황금 코인 외곽 링 */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill={isFrozen ? "#bae6fd" : "#f59e0b"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 코인 안쪽 면 */}
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={isFrozen ? "#e0f2fe" : "#fbbf24"}
          stroke="#d97706"
          strokeWidth="2"
        />

        {/* 코인 중앙 별 / 택배 마크 (★) */}
        <text
          x="50"
          y="54"
          fontSize="24"
          fill={isFrozen ? "#0284c7" : "#b45309"}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="900"
        >
          ★
        </text>

        {/* 하이라이트 광택 */}
        <path
          d="M 28 36 A 24 24 0 0 1 60 26"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="26" cy="44" r="2" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  );
}
