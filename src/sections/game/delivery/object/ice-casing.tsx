import React from "react";

interface IceCasingProps {
  children?: React.ReactNode;
}

export default function IceCasing({ children }: IceCasingProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      {/* Underlying block with cold blue tint */}
      <div className="w-full h-full flex items-center justify-center contrast-105 brightness-95">
        {children}
      </div>

      {/* Glossy 3D Ice Casing SVG Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-0.5">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          <defs>
            <linearGradient
              id="iceGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="iceHighlight" x1="0%" y1="0%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Ice Block Outer Shell (rounded rect) */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="16"
            ry="16"
            fill="url(#iceGradient)"
            stroke="#7DD3FC"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Beveled Inner Border for 3D depth */}
          <rect
            x="7"
            y="7"
            width="86"
            height="86"
            rx="13"
            ry="13"
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Shiny Top-Left Corner Diagonal Reflections */}
          <path
            d="M 12 8 L 88 8 C 88 8, 48 48, 12 8 Z"
            fill="url(#iceHighlight)"
            opacity="0.5"
          />
          <path d="M 14 14 L 38 14 L 14 38 Z" fill="#FFFFFF" opacity="0.65" />
          <path
            d="M 14 44 L 54 14"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 14 54 L 64 14"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Ice Crack details */}
          <path
            d="M 22 75 L 34 65 L 30 55 L 42 48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path
            d="M 34 65 L 44 68"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Top Icicles hanging */}
          <path
            d="M 18 10 L 22 22 L 26 10 L 34 26 L 40 10 L 52 24 L 58 10 L 68 22 L 74 10 L 82 18 L 86 10"
            fill="#E0F2FE"
            stroke="#7DD3FC"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Bottom Frost Accents */}
          <circle cx="18" cy="84" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="82" cy="84" r="2" fill="#FFFFFF" opacity="0.8" />

          {/* Shivering Cold Snowflakes in top-right corner */}
          <path
            d="M 82 22 L 82 30 M 78 26 L 86 26 M 79 23 L 85 29 M 85 23 L 79 29"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>
    </div>
  );
}
