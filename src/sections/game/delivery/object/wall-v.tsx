import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallV;

interface WallVProps {
  isFrozen?: boolean;
}

export default function WallV({ isFrozen = false }: WallVProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 세로형 주택 가벽/차단 펜스 본체 */}
        <rect
          x="16"
          y="4"
          width="68"
          height="92"
          rx="12"
          fill={isFrozen ? "#c7d2fe" : "#3b82f6"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 내부 격자 펜스 / 주택 보안 가벽 패널 */}
        <rect
          x="22"
          y="10"
          width="56"
          height="80"
          rx="8"
          fill={isFrozen ? "#dbeafe" : "#60a5fa"}
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 상/하단 방향 이동 화살표 인디케이터 (▲ ▼) */}
        <polygon points="50,14 38,24 62,24" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="50,86 38,76 62,76" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

        {/* 세로 줄무늬 펜스 디테일 */}
        <line x1="36" y1="28" x2="36" y2="72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="28" x2="50" y2="72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="64" y1="28" x2="64" y2="72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

        {/* 중앙 보안 센서등 */}
        <circle cx="50" cy="50" r="7" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
}
