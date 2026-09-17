import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wallAutoH;

interface WallAutoHProps {
  isFrozen?: boolean;
}

function WallAutoH({ isFrozen = false }: WallAutoHProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 오토 가로 셔터 본체 */}
        <rect
          x="4"
          y="16"
          width="92"
          height="68"
          rx="12"
          fill={isFrozen ? "#c4b5fd" : "#8b5cf6"}
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* 내부 패널 */}
        <rect
          x="10"
          y="22"
          width="80"
          height="56"
          rx="8"
          fill={isFrozen ? "#e9d5ff" : "#a78bfa"}
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 좌/우 자동 이동 네온 화살표 */}
        <polygon points="14,50 24,38 24,62" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points="86,50 76,38 76,62" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />

        {/* 자동 셔터 세로 슬랫 */}
        <line x1="36" y1="28" x2="36" y2="72" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="46" y1="28" x2="46" y2="72" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="56" y1="28" x2="56" y2="72" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="66" y1="28" x2="66" y2="72" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" />

        {/* AUTO 표기 */}
        <rect x="44" y="36" width="14" height="28" rx="3" fill="#0f172a" />
        <text x="51" y="52" fontSize="6" fill="#38bdf8" fontWeight="bold" textAnchor="middle" transform="rotate(-90 51 52)">AUTO</text>
      </svg>
    </div>
  );
}

export default React.memo(WallAutoH);
