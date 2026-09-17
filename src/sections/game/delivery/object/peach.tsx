import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.peach;

interface PeachProps {
  isFrozen?: boolean;
}

export default function Peach({ isFrozen = false }: PeachProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none animate-pulse"
      style={{ transform: `scale(${SCALE})`, animationDuration: "2s" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 그림자 */}
        <ellipse cx="50" cy="88" rx="34" ry="7" fill="#0f172a" opacity="0.2" />

        {/* 선물 상자 본체 (핑크/로즈 배송 박스) */}
        <rect
          x="18"
          y="34"
          width="64"
          height="52"
          rx="6"
          fill={isFrozen ? "#c4b5fd" : "#f43f5e"}
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* 상자 뚜껑 */}
        <rect
          x="14"
          y="26"
          width="72"
          height="14"
          rx="4"
          fill={isFrozen ? "#ddd6fe" : "#fb7185"}
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* 선물 리본 띠 (세로) */}
        <rect
          x="44"
          y="26"
          width="12"
          height="60"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="1.5"
        />

        {/* 상단 리본 매듭 (Bow Ribbon) */}
        <g transform="translate(50, 24)">
          {/* 좌측 리본 날개 */}
          <path
            d="M 0 0 C -16 -16, -20 -4, 0 0 Z"
            fill="#facc15"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          {/* 우측 리본 날개 */}
          <path
            d="M 0 0 C 16 -16, 20 -4, 0 0 Z"
            fill="#facc15"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          {/* 리본 중심 매듭 */}
          <circle cx="0" cy="0" r="4.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
        </g>

        {/* 반짝이 */}
        <text x="64" y="22" fontSize="12">✨</text>
      </svg>
    </div>
  );
}
