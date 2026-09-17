import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.apple;

interface AppleProps {
  isFrozen?: boolean;
}

export default function Apple({ isFrozen = false }: AppleProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none animate-pulse"
      style={{ transform: `scale(${SCALE})`, animationDuration: "2s" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 우편 봉투 본체 */}
        <rect
          x="14"
          y="26"
          width="72"
          height="52"
          rx="6"
          fill={isFrozen ? "#dbeafe" : "#ffffff"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 봉투 접힌 선 (V라인) */}
        <polygon
          points="14,26 50,56 86,26"
          fill={isFrozen ? "#bfdbfe" : "#f1f5f9"}
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 하단 닫힘 선 */}
        <line x1="14" y1="78" x2="38" y2="52" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="86" y1="78" x2="62" y2="52" stroke="#cbd5e1" strokeWidth="2" />

        {/* 중앙 빨간색 특급 배송 하트/실링 왁스 인장 (❤️) */}
        <circle cx="50" cy="54" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <text
          x="50"
          y="57"
          fontSize="9"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
        >
          ★
        </text>

        {/* 우측 상단 우표 (스탬프) */}
        <g transform="translate(64, 30)">
          <rect x="0" y="0" width="14" height="16" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <polygon points="7,4 3,12 11,12" fill="#ffffff" />
        </g>

        {/* 반짝이 별빛 */}
        <text x="10" y="24" fontSize="12">✨</text>
      </svg>
    </div>
  );
}
