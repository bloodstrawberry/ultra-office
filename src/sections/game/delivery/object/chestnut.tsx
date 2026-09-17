import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.chestnut;

export default function Chestnut() {
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
          d="M 50 15 C 20 40, 15 65, 30 85 C 40 95, 60 95, 70 85 C 85 65, 80 40, 50 15 Z"
          fill="#9C5A33"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 30 85 C 40 95, 60 95, 70 85 C 65 75, 35 75, 30 85 Z"
          fill="#E8B57D"
          stroke="#221C14"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="60" r="4.5" fill="#221C14" />
        <circle cx="62" cy="60" r="4.5" fill="#221C14" />
        <circle cx="28" cy="65" r="4" fill="#7A4222" opacity="0.6" />
        <circle cx="72" cy="65" r="4" fill="#7A4222" opacity="0.6" />
        <path
          d="M 46 66 Q 50 70 54 66"
          fill="none"
          stroke="#221C14"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 30 45 A 15 15 0 0 1 42 30"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
