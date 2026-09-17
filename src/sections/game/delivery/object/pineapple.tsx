import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.pineapple;

interface PineappleProps {
  isFrozen?: boolean;
}

export default function Pineapple({ isFrozen = false }: PineappleProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        <path
          d="M 50 30 L 35 5 L 45 25 L 50 5 L 55 25 L 65 5 L 50 30 Z"
          fill={isFrozen ? "#66B088" : "#84D136"}
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 42 30 L 25 15 L 38 35 Z"
          fill={isFrozen ? "#448060" : "#66B022"}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 58 30 L 75 15 L 62 35 Z"
          fill={isFrozen ? "#448060" : "#66B022"}
          stroke="#221C14"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <ellipse
          cx="50"
          cy="65"
          rx="30"
          ry="34"
          fill={isFrozen ? "#E6B822" : "#FFC926"}
          stroke="#221C14"
          strokeWidth="4"
        />
        <path
          d="M 28 50 L 72 80 M 23 65 L 60 90 M 40 38 L 77 65"
          fill="none"
          stroke="#DDA810"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 77 65 L 40 90 M 60 38 L 23 65"
          fill="none"
          stroke="#DDA810"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Cool Sunglasses Face 😎 / Frozen Shivering Face 🥶 */}
        {isFrozen ? (
          <>
            {/* Top leaf icicles */}
            <path
              d="M 33 22 L 35 30 L 37 22 Z"
              fill="#E0F2FE"
              stroke="#221C14"
              strokeWidth="1"
            />
            <path
              d="M 63 22 L 65 30 L 67 22 Z"
              fill="#E0F2FE"
              stroke="#221C14"
              strokeWidth="1"
            />

            {/* Frosted / Cracked Icy Sunglasses */}
            <path
              d="M 28 59 H 48 V 66 C 48 69, 44 71, 38 71 C 32 71, 28 69, 28 66 Z"
              fill="#1E3A5F"
              stroke="#221C14"
              strokeWidth="2.5"
            />
            <path
              d="M 52 59 H 72 V 66 C 72 69, 68 71, 62 71 C 56 71, 52 69, 52 66 Z"
              fill="#1E3A5F"
              stroke="#221C14"
              strokeWidth="2.5"
            />
            <line
              x1="47"
              y1="61"
              x2="53"
              y2="61"
              stroke="#221C14"
              strokeWidth="3"
            />
            {/* Ice cracks on lenses */}
            <path
              d="M 31 61 L 38 65 L 45 62"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 55 62 L 62 66 L 69 63"
              stroke="#7DD3FC"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Snow on top of sunglasses rim */}
            <path
              d="M 26 59 Q 38 56 49 59 Q 60 56 74 59"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle cx="25" cy="73" r="4" fill="#38BDF8" opacity="0.8" />
            <circle cx="75" cy="73" r="4" fill="#38BDF8" opacity="0.8" />

            {/* Wide frozen shivering teeth mouth [====] */}
            <path
              d="M 42 75 H 58 V 80 H 42 Z"
              fill="#E0F2FE"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line
              x1="47"
              y1="75"
              x2="47"
              y2="80"
              stroke="#221C14"
              strokeWidth="1.2"
            />
            <line
              x1="53"
              y1="75"
              x2="53"
              y2="80"
              stroke="#221C14"
              strokeWidth="1.2"
            />
          </>
        ) : (
          <>
            {/* Sunglasses Lenses */}
            <path
              d="M 28 59 H 48 V 66 C 48 69, 44 71, 38 71 C 32 71, 28 69, 28 66 Z"
              fill="#221C14"
            />
            <path
              d="M 52 59 H 72 V 66 C 72 69, 68 71, 62 71 C 56 71, 52 69, 52 66 Z"
              fill="#221C14"
            />
            <line
              x1="47"
              y1="61"
              x2="53"
              y2="61"
              stroke="#221C14"
              strokeWidth="3"
            />
            <line
              x1="31"
              y1="61"
              x2="43"
              y2="68"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <line
              x1="55"
              y1="61"
              x2="67"
              y2="68"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx="26" cy="71" r="3.5" fill="#FF9900" opacity="0.5" />
            <circle cx="74" cy="71" r="3.5" fill="#FF9900" opacity="0.5" />
            <path
              d="M 46 76 Q 52 79 57 74"
              fill="none"
              stroke="#221C14"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}
