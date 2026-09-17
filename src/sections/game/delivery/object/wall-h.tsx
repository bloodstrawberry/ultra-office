import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallH;

interface WallHProps {
  isFrozen?: boolean;
}

export default function WallH({ isFrozen = false }: WallHProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 가로형 주택 가벽/차단 펜스 본체 */}
        <rect
          x="4"
          y="16"
          width="92"
          height="68"
          rx="12"
          fill={isFrozen ? "#c7d2fe" : "#3b82f6"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 내부 격자 펜스 패널 */}
        <rect
          x="10"
          y="22"
          width="80"
          height="56"
          rx="8"
          fill={isFrozen ? "#dbeafe" : "#60a5fa"}
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 좌/우단 방향 이동 화살표 인디케이터 (◀ ▶) */}
        <polygon points="14,50 24,38 24,62" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="86,50 76,38 76,62" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

        {/* 가로 줄무늬 펜스 디테일 */}
        <line x1="28" y1="36" x2="72" y2="36" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="50" x2="72" y2="50" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="64" x2="72" y2="64" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

        {/* 중앙 보안 센서등 */}
        <circle cx="50" cy="50" r="7" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
}
