import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.bomb;

interface BombProps {
  isFrozen?: boolean;
}

export default function Bomb({ isFrozen = false }: BombProps) {
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
        <ellipse cx="50" cy="88" rx="36" ry="7" fill="#0f172a" opacity="0.25" />

        {/* 상단 도화선 & 스파크 */}
        <path
          d="M 50 18 Q 58 10, 54 6 Q 50 2, 58 2"
          fill="none"
          stroke="#78350f"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {!isFrozen ? (
          <g className="animate-ping" style={{ transformOrigin: "58px 2px", animationDuration: "1s" }}>
            <circle cx="58" cy="2" r="4" fill="#ef4444" />
            <circle cx="58" cy="2" r="2" fill="#facc15" />
          </g>
        ) : (
          <path d="M 54 2 L 62 2 L 58 8 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
        )}

        {/* 위험물 상자 몸체 (빨간색/주황색 컨테이너 크레이트) */}
        <rect
          x="12"
          y="18"
          width="76"
          height="68"
          rx="8"
          fill={isFrozen ? "#475569" : "#dc2626"}
          stroke="#7f1d1d"
          strokeWidth="3.5"
        />

        {/* 안쪽 쉐이드 */}
        <rect
          x="16"
          y="22"
          width="68"
          height="60"
          rx="6"
          fill={isFrozen ? "#64748b" : "#ef4444"}
        />

        {/* 상단/하단 경고 노랑-검정 스트라이프 띠 */}
        <g stroke="#facc15" strokeWidth="4">
          {/* 상단 스트라이프 */}
          <line x1="16" y1="30" x2="24" y2="22" />
          <line x1="28" y1="30" x2="36" y2="22" />
          <line x1="40" y1="30" x2="48" y2="22" />
          <line x1="52" y1="30" x2="60" y2="22" />
          <line x1="64" y1="30" x2="72" y2="22" />
          <line x1="76" y1="30" x2="84" y2="22" />

          {/* 하단 스트라이프 */}
          <line x1="16" y1="82" x2="24" y2="74" />
          <line x1="28" y1="82" x2="36" y2="74" />
          <line x1="40" y1="82" x2="48" y2="74" />
          <line x1="52" y1="82" x2="60" y2="74" />
          <line x1="64" y1="82" x2="72" y2="74" />
          <line x1="76" y1="82" x2="84" y2="74" />
        </g>

        {/* 중앙 노란색 다이아몬드 위험물 라벨 (HAZARD / DANGER) */}
        <polygon
          points="50,34 72,52 50,70 28,52"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 폭탄 심볼 (💣) / TNT 글씨 */}
        <g transform="translate(42, 44)">
          <circle cx="8" cy="10" r="7" fill="#0f172a" />
          <rect x="6" y="2" width="4" height="3" fill="#0f172a" />
          <path d="M 8 2 Q 12 -2, 14 0" fill="none" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="10" cy="8" r="1.5" fill="#ffffff" />
        </g>

        {/* 얼어붙은 이펙트 */}
        {isFrozen && (
          <g>
            <path d="M 22 26 L 26 34 L 30 26" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M 70 26 L 74 34 L 78 26" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
