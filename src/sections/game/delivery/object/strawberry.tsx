import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.strawberry;

export type DeliveryTruckDirection = "up" | "down" | "left" | "right";

interface StrawberryProps {
  isFrozen?: boolean;
  direction?: DeliveryTruckDirection;
}

const DIRECTION_ROTATION: Record<DeliveryTruckDirection, number> = {
  left: 0,
  up: 90,
  right: 180,
  down: 270,
};

export default function Strawberry({
  isFrozen = false,
  direction = "left",
}: StrawberryProps) {
  const rotation = DIRECTION_ROTATION[direction] ?? 0;

  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none transition-transform duration-150 ease-out"
      style={{
        transform: `scale(${SCALE}) rotate(${rotation}deg)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* 그림자 */}
        <ellipse
          cx="50"
          cy="86"
          rx="38"
          ry="10"
          fill="#1e293b"
          opacity="0.25"
        />

        {/* 바퀴 4개 (좌우 하단/상단 돌출) */}
        {/* 앞바퀴 (상단/하단) */}
        <rect
          x="12"
          y="24"
          width="12"
          height="16"
          rx="4"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <rect
          x="12"
          y="60"
          width="12"
          height="16"
          rx="4"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        {/* 뒷바퀴 (상단/하단) */}
        <rect
          x="76"
          y="24"
          width="12"
          height="16"
          rx="4"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <rect
          x="76"
          y="60"
          width="12"
          height="16"
          rx="4"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* 메인 차체 (바디) */}
        <rect
          x="16"
          y="20"
          width="68"
          height="60"
          rx="14"
          fill={isFrozen ? "#60a5fa" : "#38bdf8"}
          stroke="#0f172a"
          strokeWidth="4"
        />

        {/* 짐칸 (화물칸 - 뒷부분) */}
        <path
          d="M 42 21 L 82 21 C 83 21 83.5 22 83.5 24 L 83.5 76 C 83.5 78 83 79 82 79 L 42 79 Z"
          fill={isFrozen ? "#93c5fd" : "#0284c7"}
        />

        {/* 화물칸 상단 택배 배송 박스 로고 (📦) */}
        <g transform="translate(54, 40) scale(0.9)">
          <rect
            x="0"
            y="0"
            width="22"
            height="20"
            rx="3"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="2"
          />
          {/* 테이프 */}
          <line
            x1="11"
            y1="0"
            x2="11"
            y2="20"
            stroke="#fbbf24"
            strokeWidth="3"
          />
          <line
            x1="0"
            y1="10"
            x2="22"
            y2="10"
            stroke="#fbbf24"
            strokeWidth="3"
          />
        </g>

        {/* 운전석 캡 (앞부분) */}
        <path
          d="M 18 24 C 18 22 20 21 22 21 L 42 21 L 42 79 L 22 79 C 20 79 18 78 18 76 Z"
          fill={isFrozen ? "#bfdbfe" : "#facc15"}
        />

        {/* 앞유리 (윈드실드) */}
        <rect
          x="20"
          y="28"
          width="18"
          height="44"
          rx="6"
          fill={isFrozen ? "#dbeafe" : "#1e293b"}
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        {/* 앞유리 반사광 */}
        <path
          d="M 23 32 L 28 32 L 24 68 L 22 68 Z"
          fill="#ffffff"
          opacity="0.6"
        />

        {/* 운전석 눈 / 캐릭터 표정 */}
        {!isFrozen ? (
          <>
            {/* 귀여운 헤드라이트 (눈) */}
            <circle cx="28" cy="38" r="4.5" fill="#fef08a" />
            <circle cx="28" cy="38" r="2.5" fill="#0f172a" />
            <circle cx="29" cy="37" r="1" fill="#ffffff" />

            <circle cx="28" cy="62" r="4.5" fill="#fef08a" />
            <circle cx="28" cy="62" r="2.5" fill="#0f172a" />
            <circle cx="29" cy="61" r="1" fill="#ffffff" />

            {/* 볼터치 */}
            <circle cx="35" cy="42" r="3" fill="#f43f5e" opacity="0.6" />
            <circle cx="35" cy="58" r="3" fill="#f43f5e" opacity="0.6" />

            {/* 범퍼 & 그릴 */}
            <rect
              x="14"
              y="44"
              width="5"
              height="12"
              rx="2.5"
              fill="#e2e8f0"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            {/* 얼어붙은 표정 (>< 눈) */}
            <path
              d="M 25 35 L 30 38 L 25 41"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 25 59 L 30 62 L 25 65"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* 고드름 장식 */}
            <path
              d="M 18 36 L 14 40 L 18 44"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
            <path
              d="M 18 56 L 14 60 L 18 64"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* 사이드미러 */}
        <rect
          x="28"
          y="15"
          width="6"
          height="6"
          rx="2"
          fill="#0f172a"
        />
        <rect
          x="28"
          y="79"
          width="6"
          height="6"
          rx="2"
          fill="#0f172a"
        />

        {/* 차량 상단 경광등 (배송 라이트) */}
        <rect
          x="44"
          y="17"
          width="12"
          height="5"
          rx="2"
          fill="#ef4444"
          stroke="#0f172a"
          strokeWidth="1.5"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
