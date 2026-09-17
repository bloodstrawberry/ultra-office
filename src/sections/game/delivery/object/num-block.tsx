import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.numBlock;

interface NumBlockProps {
  num: number;
  active: boolean;
}

// 숫자별 과일 느낌 색상 팔레트
const NUM_COLORS: Record<number, { bg: string; dark: string; blush: string }> =
  {
    1: { bg: "#FF6B6B", dark: "#CC4444", blush: "#FF9999" }, // 딸기빛 빨강
    2: { bg: "#FFB347", dark: "#CC8833", blush: "#FFCC88" }, // 오렌지빛
    3: { bg: "#77DD77", dark: "#55AA55", blush: "#AAFFAA" }, // 사과빛 초록
    4: { bg: "#89CFF0", dark: "#5599CC", blush: "#BBDDFF" }, // 블루베리빛
    5: { bg: "#CB99C9", dark: "#9966AA", blush: "#E8CCE8" }, // 포도빛 보라
  };

export default function NumBlock({ num, active }: NumBlockProps) {
  const colors = NUM_COLORS[num] ?? NUM_COLORS[1];

  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none transition-all duration-300 ${
        active ? "" : "grayscale opacity-50"
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        {/* Leaf on top */}
        <path
          d="M 50 18 C 42 8, 36 14, 44 22 Z"
          fill="#7CB342"
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 50 18 C 58 8, 64 14, 56 22 Z"
          fill="#8BC34A"
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Stem */}
        <path
          d="M 50 8 Q 48 15, 50 20"
          fill="none"
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Main body - rounded badge shape */}
        <circle
          cx="50"
          cy="55"
          r="32"
          fill={colors.bg}
          stroke="#221C14"
          strokeWidth="4"
        />

        {/* Inner lighter circle */}
        <circle
          cx="50"
          cy="55"
          r="24"
          fill="none"
          stroke={colors.blush}
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Number text */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="36"
          fontWeight="900"
          stroke="#221C14"
          strokeWidth="3"
          paintOrder="stroke"
          fontFamily="'Arial Rounded MT Bold', 'Nunito', sans-serif"
        >
          {num}
        </text>

        {/* Blush cheeks */}
        <circle cx="30" cy="68" r="5" fill={colors.dark} opacity="0.35" />
        <circle cx="70" cy="68" r="5" fill={colors.dark} opacity="0.35" />

        {/* Highlight */}
        <path
          d="M 30 40 A 20 20 0 0 1 40 30"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
    </div>
  );
}
