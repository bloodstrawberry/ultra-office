import React from "react";
import { OBJECT_SCALES } from "./constants";

export interface PortalProps {
  type?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  closing?: boolean;
}

export default function Portal({ type = 1, closing = false }: PortalProps) {
  const scale = OBJECT_SCALES.portal ?? OBJECT_SCALES.wormhole ?? 1.0;

  // Rainbow Color themes: 1 (Red), 2 (Orange), 3 (Yellow), 4 (Green), 5 (Blue), 6 (Indigo), 7 (Purple)
  const colorThemes = {
    1: {
      primary: "#ef4444", // 🔴 Red (빨강)
      secondary: "#f43f5e",
      accent: "#fca5a5",
      glow: "rgba(239, 68, 68, 0.6)",
      bgGradientFrom: "#7f1d1d",
      bgGradientTo: "#450a0a",
      ringColor: "#f87171",
    },
    2: {
      primary: "#f97316", // 🟠 Orange (주황)
      secondary: "#ea580c",
      accent: "#fdba74",
      glow: "rgba(249, 115, 22, 0.6)",
      bgGradientFrom: "#7c2d12",
      bgGradientTo: "#431407",
      ringColor: "#fb923c",
    },
    3: {
      primary: "#eab308", // 🟡 Yellow (노랑)
      secondary: "#ca8a04",
      accent: "#fef08a",
      glow: "rgba(234, 179, 8, 0.6)",
      bgGradientFrom: "#713f12",
      bgGradientTo: "#422006",
      ringColor: "#fde047",
    },
    4: {
      primary: "#10b981", // 🟢 Green (초록)
      secondary: "#059669",
      accent: "#6ee7b7",
      glow: "rgba(16, 185, 129, 0.6)",
      bgGradientFrom: "#064e3b",
      bgGradientTo: "#022c22",
      ringColor: "#34d399",
    },
    5: {
      primary: "#3b82f6", // 🔵 Blue (파랑)
      secondary: "#2563eb",
      accent: "#93c5fd",
      glow: "rgba(59, 130, 246, 0.6)",
      bgGradientFrom: "#1e3a8a",
      bgGradientTo: "#172554",
      ringColor: "#60a5fa",
    },
    6: {
      primary: "#6366f1", // 🔷 Indigo (남색)
      secondary: "#4f46e5",
      accent: "#a5b4fc",
      glow: "rgba(99, 102, 241, 0.6)",
      bgGradientFrom: "#312e81",
      bgGradientTo: "#1e1b4b",
      ringColor: "#818cf8",
    },
    7: {
      primary: "#a855f7", // 🟣 Purple (보라)
      secondary: "#9333ea",
      accent: "#d8b4fe",
      glow: "rgba(168, 85, 247, 0.6)",
      bgGradientFrom: "#581c87",
      bgGradientTo: "#3b0764",
      ringColor: "#c084fc",
    },
  };

  const theme = colorThemes[type] || colorThemes[1];

  return (
    <div
      className={`w-full h-full flex items-center justify-center relative select-none pointer-events-none ${
        closing ? "animate-portal-close" : ""
      }`}
      style={{
        transform: `scale(${scale})`,
        animation: closing
          ? undefined
          : "portal-pulse 2s ease-in-out infinite alternate",
      }}
    >
      {/* Mystic Ambient Glow Aura */}
      <div
        className="absolute inset-0 rounded-full blur-[6px]"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 80%)`,
        }}
      />

      {/* SVG Dimensional Portal Gate */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 4px ${theme.primary})` }}
      >
        <defs>
          <radialGradient id={`portal-core-${type}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#050510" stopOpacity="0.95" />
            <stop
              offset="90%"
              stopColor={theme.bgGradientFrom}
              stopOpacity="0.8"
            />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient
            id={`portal-flare-${type}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={theme.accent} stopOpacity="1" />
            <stop offset="50%" stopColor={theme.primary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.2" />
          </linearGradient>

          <linearGradient
            id={`portal-flare-rev-${type}`}
            x1="100%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={theme.ringColor} stopOpacity="1" />
            <stop offset="60%" stopColor={theme.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          <filter id={`glow-intense-${type}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark Inner Core */}
        <circle cx="50" cy="50" r="32" fill={`url(#portal-core-${type})`} />

        {/* Outer Ring Glow Base */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={theme.secondary}
          strokeWidth="8"
          opacity="0.4"
          filter={`url(#glow-intense-${type})`}
        />

        {/* Jagged Energy Ring 1 (Clockwise Fast) */}
        <g
          className="animate-spin"
          style={{ transformOrigin: "50px 50px", animationDuration: "3s" }}
        >
          {/* Main crescent arc */}
          <path
            d="M 50 10 A 40 40 0 0 1 90 50 Q 85 40 78 40 A 28 28 0 0 0 50 22 Q 40 18 50 10 Z"
            fill={`url(#portal-flare-${type})`}
            filter={`url(#glow-intense-${type})`}
          />
          {/* Secondary crescent arc */}
          <path
            d="M 50 90 A 40 40 0 0 1 10 50 Q 15 60 22 60 A 28 28 0 0 0 50 78 Q 60 82 50 90 Z"
            fill={`url(#portal-flare-${type})`}
          />
          {/* Sharp energy spikes */}
          <path d="M 85 25 L 92 18 L 88 28 Z" fill={theme.accent} />
          <path d="M 15 75 L 8 82 L 12 72 Z" fill={theme.accent} />
          <path
            d="M 88 50 L 96 45 L 94 55 Z"
            fill={theme.primary}
            opacity="0.8"
          />
        </g>

        {/* Jagged Energy Ring 2 (Counter-Clockwise) */}
        <g
          className="animate-spin"
          style={{
            transformOrigin: "50px 50px",
            animationDuration: "4s",
            animationDirection: "reverse",
          }}
        >
          {/* Irregular jagged ring */}
          <path
            d="M 50 14 Q 70 12 82 28 Q 70 20 50 22 Q 30 20 18 28 Q 30 12 50 14 Z"
            fill={`url(#portal-flare-rev-${type})`}
            transform="rotate(45 50 50)"
          />
          <path
            d="M 50 86 Q 70 88 82 72 Q 70 80 50 78 Q 30 80 18 72 Q 30 88 50 86 Z"
            fill={`url(#portal-flare-rev-${type})`}
            transform="rotate(45 50 50)"
          />
          {/* Thin sharp lightning-like arcs */}
          <path
            d="M 12 50 Q 10 30 25 15 L 20 20 Q 15 35 15 50 Z"
            fill={theme.ringColor}
            filter={`url(#glow-intense-${type})`}
          />
          <path
            d="M 88 50 Q 90 70 75 85 L 80 80 Q 85 65 85 50 Z"
            fill={theme.ringColor}
          />
        </g>

        {/* Additional electric/jagged highlights on the edge */}
        <g
          className="animate-spin"
          style={{ transformOrigin: "50px 50px", animationDuration: "5s" }}
        >
          <path
            d="M 50 16 L 55 12 L 60 18 L 65 14"
            fill="none"
            stroke={theme.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-intense-${type})`}
          />
          <path
            d="M 16 50 L 12 45 L 18 40 L 14 35"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
