import React from "react";
import { SOIL_TILE_BORDER_WIDTH } from "./constants";

export interface SoilTileProps {
  borderTop?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderWidth?: number;
}

export default function SoilTileDark({
  borderTop = false,
  borderBottom = false,
  borderLeft = false,
  borderRight = false,
  borderWidth = SOIL_TILE_BORDER_WIDTH,
}: SoilTileProps) {
  const innerLineOffset = borderWidth - 0.5;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-[102%] h-[102%] -m-[1%] object-cover pointer-events-none select-none"
    >
      {/* 1. Base Asphalt Fill (어두운 아스팔트) */}
      <rect x="-1" y="-1" width="102" height="102" fill="#1e293b" />

      {/* 2. 도로 표면 텍스처 (자갈/아스팔트 도트) */}
      <circle cx="25" cy="25" r="1.5" fill="#334155" opacity="0.6" />
      <circle cx="75" cy="20" r="1.5" fill="#334155" opacity="0.6" />
      <circle cx="20" cy="70" r="1.5" fill="#334155" opacity="0.6" />
      <circle cx="65" cy="60" r="1.5" fill="#334155" opacity="0.6" />
      <circle cx="80" cy="80" r="1.5" fill="#334155" opacity="0.6" />

      {/* 3. 도로 연석 / 경계석 (Borders) */}
      {borderTop && (
        <>
          <rect x="-1" y="-1" width="102" height={borderWidth} fill="#0f172a" />
          <line
            x1="-1"
            y1={innerLineOffset}
            x2="101"
            y2={innerLineOffset}
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </>
      )}
      {borderBottom && (
        <>
          <rect
            x="-1"
            y={100 - borderWidth}
            width="102"
            height={borderWidth + 1}
            fill="#0f172a"
          />
          <line
            x1="-1"
            y1={100 - innerLineOffset}
            x2="101"
            y2={100 - innerLineOffset}
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </>
      )}
      {borderLeft && (
        <>
          <rect x="-1" y="-1" width={borderWidth} height="102" fill="#0f172a" />
          <line
            x1={innerLineOffset}
            y1="-1"
            x2={innerLineOffset}
            y2="101"
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </>
      )}
      {borderRight && (
        <>
          <rect
            x={100 - borderWidth}
            y="-1"
            width={borderWidth + 1}
            height="102"
            fill="#0f172a"
          />
          <line
            x1={100 - innerLineOffset}
            y1="-1"
            x2={100 - innerLineOffset}
            y2="101"
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </>
      )}
    </svg>
  );
}
