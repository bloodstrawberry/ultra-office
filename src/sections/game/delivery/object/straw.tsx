import React from "react";
import { OBJECT_SCALES } from "./constants";

const SCALE = OBJECT_SCALES.straw ?? 1.2;

export interface StrawProps {
  count?: number; // 1 to 5 strings
}

export default function Straw({ count = 2 }: StrawProps) {
  // Clamp count between 1 and 5
  const ropeCount = Math.max(1, Math.min(5, count));

  // Determine Y positions for horizontal rope bands
  const getRopeYPositions = (cnt: number): number[] => {
    switch (cnt) {
      case 1:
        return [50];
      case 2:
        return [34, 66];
      case 3:
      case 4:
      case 5:
        return [26, 50, 74];
      default:
        return [34, 66];
    }
  };

  // Determine X positions for vertical rope bands (4th: 1 vertical, 5th: 2 vertical)
  const getRopeXPositions = (cnt: number): number[] => {
    switch (cnt) {
      case 4:
        return [50];
      case 5:
        return [36, 64];
      default:
        return [];
    }
  };

  const ropeYPositions = getRopeYPositions(ropeCount);
  const ropeXPositions = getRopeXPositions(ropeCount);

  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* Vibrant Golden Straw Body Gradient */}
          <linearGradient
            id="strawFruitThemeGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="40%" stopColor="#FFCA28" />
            <stop offset="80%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Rope Inner Gradient */}
          <linearGradient id="ropeThemeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="50%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
        </defs>

        {/* Plump & Rounded Straw Bundle Body (Matching Fruit Theme) */}
        <rect
          x="14"
          y="10"
          width="72"
          height="80"
          rx="18"
          ry="18"
          fill="url(#strawFruitThemeGrad)"
          stroke="#221C14"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Straw Strand Texture Lines */}
        <g opacity="0.3" stroke="#F57F17" strokeWidth="2" strokeLinecap="round">
          <line x1="25" y1="16" x2="24" y2="84" strokeDasharray="6 4" />
          <line x1="34" y1="14" x2="35" y2="86" strokeDasharray="8 5" />
          <line x1="44" y1="13" x2="43" y2="87" strokeDasharray="5 4" />
          <line x1="53" y1="13" x2="54" y2="87" strokeDasharray="7 3" />
          <line x1="62" y1="14" x2="61" y2="86" strokeDasharray="6 4" />
          <line x1="71" y1="16" x2="72" y2="84" strokeDasharray="8 5" />
        </g>

        {/* Indifferent Chic Face */}
        <g id="strawFace">
          {/* Left Eye - Half-lidded */}
          <path d="M 33 51 Q 38 47 43 51" fill="#221C14" stroke="none" />
          <line
            x1="32"
            y1="51"
            x2="44"
            y2="51"
            stroke="#221C14"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Right Eye - Half-lidded */}
          <path d="M 57 51 Q 62 47 67 51" fill="#221C14" stroke="none" />
          <line
            x1="56"
            y1="51"
            x2="68"
            y2="51"
            stroke="#221C14"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Flat Unimpressed Mouth */}
          <line
            x1="44"
            y1="58"
            x2="56"
            y2="58"
            stroke="#221C14"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Top Glossy Highlight Curve */}
        <path
          d="M 24 16 A 18 18 0 0 1 40 13"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="22" cy="22" r="2" fill="#FFFFFF" opacity="0.55" />

        {/* Tied Horizontal Rope Bands (with Dark Fruit Theme Outlines & Subtle Translucency) */}
        {ropeYPositions.map((yPos, idx) => (
          <g key={`horiz-${idx}`} opacity="0.65">
            {/* Outer Dark Border */}
            <path
              d={`M 13 ${yPos} Q 50 ${yPos + 2} 87 ${yPos}`}
              fill="none"
              stroke="#221C14"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Inner Rope Fill */}
            <path
              d={`M 14 ${yPos} Q 50 ${yPos + 2} 86 ${yPos}`}
              fill="none"
              stroke="url(#ropeThemeGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rope Texture Fiber */}
            <path
              d={`M 16 ${yPos - 0.5} Q 50 ${yPos + 1.5} 84 ${yPos - 0.5}`}
              fill="none"
              stroke="#D7CCC8"
              strokeWidth="1"
              strokeDasharray="4 2"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Tied Knot Detail at Right Edge */}
            <circle
              cx="80"
              cy={yPos + 0.5}
              r="3"
              fill="#3E2723"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <path
              d={`M 80 ${yPos + 2} C 83 ${yPos + 6}, 85 ${yPos + 8}, 82 ${yPos + 10}`}
              fill="none"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={`M 78 ${yPos + 2} C 75 ${yPos + 6}, 73 ${yPos + 8}, 76 ${yPos + 10}`}
              fill="none"
              stroke="#221C14"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Tied Vertical Rope Bands (4th: 1 vertical, 5th: 2 vertical) */}
        {ropeXPositions.map((xPos, idx) => (
          <g key={`vert-${idx}`} opacity="0.65">
            {/* Outer Dark Border */}
            <path
              d={`M ${xPos} 9 Q ${xPos + 1} 50 ${xPos} 91`}
              fill="none"
              stroke="#221C14"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Inner Rope Fill */}
            <path
              d={`M ${xPos} 10 Q ${xPos + 1} 50 ${xPos} 90`}
              fill="none"
              stroke="url(#ropeThemeGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rope Texture Fiber */}
            <path
              d={`M ${xPos - 0.5} 12 Q ${xPos + 1} 50 ${xPos - 0.5} 88`}
              fill="none"
              stroke="#D7CCC8"
              strokeWidth="1"
              strokeDasharray="4 2"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Tied Knot Detail at Bottom Edge */}
            <circle
              cx={xPos}
              cy="90"
              r="3"
              fill="#3E2723"
              stroke="#221C14"
              strokeWidth="1.5"
            />
            <path
              d={`M ${xPos + 1.5} 90 C ${xPos + 4} 93, ${xPos + 6} 95, ${xPos + 4} 97`}
              fill="none"
              stroke="#221C14"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={`M ${xPos - 1.5} 90 C ${xPos - 4} 93, ${xPos - 6} 95, ${xPos - 4} 97`}
              fill="none"
              stroke="#221C14"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
