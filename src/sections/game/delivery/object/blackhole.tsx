import React from "react";
import { OBJECT_SCALES } from "./constants";

export interface BlackholeProps {
  type?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export default function Blackhole({ type = 1 }: BlackholeProps) {
  const scale = OBJECT_SCALES.blackhole ?? 1.0;

  // Rainbow Color themes for Blackhole: 1 (Red), 2 (Orange), 3 (Yellow), 4 (Green), 5 (Blue), 6 (Indigo), 7 (Purple)
  const colorThemes = {
    1: {
      darkBase: "#31040d",
      primary: "#dc2626",
      secondary: "#f43f5e",
      accent: "#fb7185",
      highlight: "#ffe4e6",
      ring: "#450a0a",
      glow: "rgba(239, 68, 68, 0.6)",
    },
    2: {
      darkBase: "#2d0d03",
      primary: "#ea580c",
      secondary: "#f97316",
      accent: "#fb923c",
      highlight: "#ffedd5",
      ring: "#431407",
      glow: "rgba(249, 115, 22, 0.6)",
    },
    3: {
      darkBase: "#2a1703",
      primary: "#ca8a04",
      secondary: "#eab308",
      accent: "#fde047",
      highlight: "#fef9c3",
      ring: "#422006",
      glow: "rgba(234, 179, 8, 0.6)",
    },
    4: {
      darkBase: "#022419",
      primary: "#059669",
      secondary: "#10b981",
      accent: "#34d399",
      highlight: "#d1fae5",
      ring: "#022c22",
      glow: "rgba(16, 185, 129, 0.6)",
    },
    5: {
      darkBase: "#0b1942",
      primary: "#2563eb",
      secondary: "#3b82f6",
      accent: "#38bdf8",
      highlight: "#e0f2fe",
      ring: "#172554",
      glow: "rgba(59, 130, 246, 0.6)",
    },
    6: {
      darkBase: "#131346",
      primary: "#4f46e5",
      secondary: "#6366f1",
      accent: "#818cf8",
      highlight: "#e0e7ff",
      ring: "#1e1b4b",
      glow: "rgba(99, 102, 241, 0.6)",
    },
    7: {
      darkBase: "#1e0a45",
      primary: "#7e22ce",
      secondary: "#a855f7",
      accent: "#38bdf8",
      highlight: "#e9d5ff",
      ring: "#3b0764",
      glow: "rgba(168, 85, 247, 0.6)",
    },
  };

  const theme = colorThemes[type] || colorThemes[1];

  // Archimedean smooth 2-turn spiral path string
  const spiralPathD =
    "M 50 4 C 75 4 96 25 96 50 C 96 75 75 92 50 92 C 25 92 10 75 10 50 C 10 29 25 16 46 16 C 66 16 80 29 80 48 C 80 65 67 76 49 76 C 34 76 24 64 24 49 C 24 36 34 26 48 26 C 60 26 68 34 68 47 C 68 57 60 63 50 63 C 43 63 38 57 38 50 C 38 44 43 40 49 40 C 53 40 55 43 55 47 A 4 4 0 0 1 48 48";

  return (
    <div
      className="w-full h-full flex items-center justify-center relative select-none pointer-events-none"
      style={{
        transform: `scale(${scale})`,
      }}
    >
      {/* Outer Gravitational Lens Glow */}
      <div
        className="absolute inset-0 rounded-full blur-[6px]"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 80%)`,
        }}
      />

      {/* SVG Blackhole Vector */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 4px ${theme.primary})` }}
      >
        <defs>
          <clipPath id={`blackhole-clip-${type}`}>
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        <g clipPath={`url(#blackhole-clip-${type})`}>
          {/* Base Dark Void Background */}
          <circle cx="50" cy="50" r="48" fill={theme.darkBase} />

          {/* Swirling Spiral Vortex Group */}
          <g
            className="animate-spin"
            style={{
              transformOrigin: "50px 50px",
              animationDuration: "8s",
              animationTimingFunction: "linear",
            }}
          >
            {/* Spiral Ribbon 1 - Primary Theme Color */}
            <path
              d={spiralPathD}
              fill="none"
              stroke={theme.primary}
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Spiral Ribbon 2 - Secondary Color (Rotated 90deg) */}
            <g transform="rotate(90 50 50)">
              <path
                d={spiralPathD}
                fill="none"
                stroke={theme.secondary}
                strokeWidth="7.5"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>

            {/* Spiral Ribbon 3 - Vibrant Accent / Cyan Color (Rotated 180deg) */}
            <g transform="rotate(180 50 50)">
              <path
                d={spiralPathD}
                fill="none"
                stroke={theme.accent}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>

            {/* Spiral Ribbon 4 - Light Highlight (Rotated 270deg) */}
            <g transform="rotate(270 50 50)">
              <path
                d={spiralPathD}
                fill="none"
                stroke={theme.highlight}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>

            {/* Embedded Sparkle Stars (✦) */}
            {/* Star 1 */}
            <path
              d="M 72 26 L 73.5 28.5 L 76 30 L 73.5 31.5 L 72 34 L 70.5 31.5 L 68 30 L 70.5 28.5 Z"
              fill="#ffffff"
            />
            {/* Star 2 */}
            <path
              d="M 25 63 L 26.5 66.5 L 30 68 L 26.5 69.5 L 25 73 L 23.5 69.5 L 20 68 L 23.5 66.5 Z"
              fill="#ffffff"
            />
            {/* Star 3 */}
            <path
              d="M 60 76 L 61.5 78.5 L 64 80 L 61.5 81.5 L 60 84 L 58.5 81.5 L 56 80 L 58.5 78.5 Z"
              fill="#ffffff"
            />
            {/* Star 4 */}
            <path
              d="M 32 19 L 33 21 L 35 22 L 33 23 L 32 25 L 31 23 L 29 22 L 31 21 Z"
              fill="#ffffff"
            />

            {/* White Star Dots */}
            <circle cx="41" cy="15" r="1.5" fill="#ffffff" />
            <circle cx="82" cy="52" r="2" fill="#ffffff" />
            <circle cx="71" cy="46" r="1.2" fill="#ffffff" opacity="0.8" />
            <circle cx="28" cy="88" r="1.5" fill="#ffffff" />
            <circle cx="85" cy="70" r="1.5" fill="#ffffff" />
            <circle cx="16" cy="38" r="1.2" fill="#ffffff" />
            <circle cx="50" cy="12" r="1.4" fill="#ffffff" opacity="0.9" />
          </g>

          {/* Singularity Outer Shadow */}
          <circle
            cx="50"
            cy="50"
            r="9.5"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            opacity="0.6"
          />

          {/* Singularity Central Black Void Core */}
          <circle cx="50" cy="50" r="7.5" fill="#000000" />
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke={theme.darkBase}
            strokeWidth="0.8"
          />
        </g>

        {/* Crisp Outer Circle Border Ring */}
        <circle
          cx="50"
          cy="50"
          r="47.5"
          fill="none"
          stroke={theme.secondary}
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
