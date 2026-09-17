import React from "react";
import { SOIL_TILE_BORDER_WIDTH } from "./constants";
import { SoilTileProps } from "./soil-tile-dark";

export default function SoilTileLight({
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
      {/* 1. Base Asphalt Fill (약간 밝은 아스팔트) */}
      <rect x="-1" y="-1" width="102" height="102" fill="#243042" />

      {/* 2. 도로 표면 텍스처 (아스팔트 도트 & 미세 하이라이트) */}
      <circle cx="35" cy="30" r="1.5" fill="#475569" opacity="0.7" />
      <circle cx="68" cy="24" r="1.5" fill="#475569" opacity="0.7" />
      <circle cx="28" cy="74" r="1.5" fill="#475569" opacity="0.7" />
      <circle cx="72" cy="68" r="1.5" fill="#475569" opacity="0.7" />
      <circle cx="50" cy="50" r="1.2" fill="#475569" opacity="0.5" />

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
