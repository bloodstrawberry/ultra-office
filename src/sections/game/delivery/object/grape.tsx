import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.grape;

interface GrapeProps {
  isFrozen?: boolean;
}

export default function Grape({ isFrozen = false }: GrapeProps) {
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
        <ellipse cx="50" cy="88" rx="30" ry="6" fill="#0f172a" opacity="0.2" />

        {/* 에어캡 배송백 본체 (보라/남색 파우치) */}
        <rect
          x="20"
          y="24"
          width="60"
          height="62"
          rx="10"
          fill={isFrozen ? "#c4b5fd" : "#8b5cf6"}
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* 상단 밀봉 덮개 테이프 */}
        <rect
          x="18"
          y="18"
          width="64"
          height="14"
          rx="4"
          fill={isFrozen ? "#e9d5ff" : "#a78bfa"}
          stroke="#0f172a"
          strokeWidth="2.5"
        />

        {/* 에어캡 도트 패턴 (엠보싱 버블) */}
        <g fill="#ffffff" opacity="0.35">
          <circle cx="32" cy="42" r="3.5" />
          <circle cx="50" cy="42" r="3.5" />
          <circle cx="68" cy="42" r="3.5" />

          <circle cx="41" cy="54" r="3.5" />
          <circle cx="59" cy="54" r="3.5" />

          <circle cx="32" cy="66" r="3.5" />
          <circle cx="50" cy="66" r="3.5" />
          <circle cx="68" cy="66" r="3.5" />
        </g>

        {/* 중앙 배송 번개 로고 스티커 */}
        <circle cx="50" cy="54" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        <polygon points="51,48 46,55 50,55 49,60 55,53 51,53" fill="#78350f" />

        {/* 반짝이 */}
        <text x="14" y="22" fontSize="12">✨</text>
      </svg>
    </div>
  );
}
