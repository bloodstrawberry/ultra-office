import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.sweetPotato;

interface SweetPotatoProps {
  isFrozen?: boolean;
}

export default function SweetPotato({ isFrozen = false }: SweetPotatoProps) {
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

        {/* 상자 본체 */}
        <rect
          x="14"
          y="18"
          width="72"
          height="68"
          rx="8"
          fill={isFrozen ? "#a5b4fc" : "#b45309"}
          stroke="#451a03"
          strokeWidth="3.5"
        />

        {/* 상자 안쪽 밝은 면 */}
        <rect
          x="18"
          y="22"
          width="64"
          height="60"
          rx="6"
          fill={isFrozen ? "#c7d2fe" : "#d97706"}
        />

        {/* 박스 이음선 */}
        <line x1="14" y1="44" x2="86" y2="44" stroke="#451a03" strokeWidth="2" />

        {/* 세로 청록색/보라색 특급 배송 테이프 */}
        <rect
          x="44"
          y="18"
          width="12"
          height="68"
          fill={isFrozen ? "#e0e7ff" : "#0284c7"}
          stroke="#0369a1"
          strokeWidth="1.5"
        />

        {/* "EXPRESS / 특급" 배송 라벨 (스티커) */}
        <g transform="translate(22, 26)">
          <rect
            x="0"
            y="0"
            width="20"
            height="14"
            rx="2"
            fill="#10b981"
            stroke="#047857"
            strokeWidth="1.5"
          />
          {/* 번개 마크 (⚡) */}
          <polygon
            points="11,2 6,8 10,8 9,12 14,6 10,6"
            fill="#facc15"
          />
        </g>

        {/* 바코드 및 배송 스티커 */}
        <g transform="translate(58, 54)">
          <rect
            x="0"
            y="0"
            width="22"
            height="24"
            rx="3"
            fill="#ffffff"
            stroke="#451a03"
            strokeWidth="1.5"
          />
          <circle cx="6" cy="6" r="2" fill="#ef4444" />
          <line x1="11" y1="6" x2="18" y2="6" stroke="#0f172a" strokeWidth="1.5" />
          {/* 바코드 */}
          <line x1="4" y1="12" x2="4" y2="20" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="7" y1="12" x2="7" y2="20" stroke="#0f172a" strokeWidth="1" />
          <line x1="10" y1="12" x2="10" y2="20" stroke="#0f172a" strokeWidth="2" />
          <line x1="14" y1="12" x2="14" y2="20" stroke="#0f172a" strokeWidth="1" />
          <line x1="18" y1="12" x2="18" y2="20" stroke="#0f172a" strokeWidth="1.5" />
        </g>

        {/* 깜찍한 눈과 볼터치 */}
        {!isFrozen ? (
          <g>
            <circle cx="34" cy="62" r="2.5" fill="#451a03" />
            <circle cx="44" cy="62" r="2.5" fill="#451a03" />
            <circle cx="30" cy="66" r="2" fill="#f43f5e" opacity="0.6" />
            <circle cx="48" cy="66" r="2" fill="#f43f5e" opacity="0.6" />
          </g>
        ) : (
          <g>
            <path d="M 32 60 L 36 64 M 36 60 L 32 64" stroke="#312e81" strokeWidth="1.5" />
            <path d="M 42 60 L 46 64 M 46 60 L 42 64" stroke="#312e81" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
