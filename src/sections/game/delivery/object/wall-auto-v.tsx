import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallAutoV;

interface WallAutoVProps {
  isFrozen?: boolean;
}

function WallAutoV({ isFrozen = false }: WallAutoVProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 오토 세로 셔터 본체 */}
        <rect
          x="16"
          y="4"
          width="68"
          height="92"
          rx="12"
          fill={isFrozen ? "#c4b5fd" : "#8b5cf6"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 내부 패널 */}
        <rect
          x="22"
          y="10"
          width="56"
          height="80"
          rx="8"
          fill={isFrozen ? "#e9d5ff" : "#a78bfa"}
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 상/하 자동 이동 네온 화살표 */}
        <polygon points="50,14 38,24 62,24" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="50,86 38,76 62,76" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />

        {/* 자동 셔터 슬랫 (Slat Lines) */}
        <line x1="28" y1="36" x2="72" y2="36" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="46" x2="72" y2="46" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="56" x2="72" y2="56" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="66" x2="72" y2="66" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />

        {/* AUTO 표기 */}
        <rect x="36" y="44" width="28" height="14" rx="3" fill="#0f172a" />
        <text x="50" y="54" fontSize="7" fill="#38bdf8" fontWeight="bold" textAnchor="middle">AUTO</text>
      </svg>
    </div>
  );
}

export default React.memo(WallAutoV);
