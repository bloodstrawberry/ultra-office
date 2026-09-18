import type { SoilTileProps } from './soil-tile-dark';

import React from 'react';

import { SOIL_TILE_BORDER_WIDTH } from './constants';

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
      {/* 
        1. Base fill 
      */}
      <rect x="-1" y="-1" width="102" height="102" fill="#a06a45" />

      {/* 
        2. Cartoon Dirt Spots 
      */}
      <ellipse cx="22" cy="24" rx="4.5" ry="3" fill="#8a5a3a" opacity="0.8" />
      <ellipse cx="78" cy="18" rx="5" ry="3.5" fill="#8a5a3a" opacity="0.8" />
      <ellipse cx="16" cy="62" rx="4" ry="2.5" fill="#8a5a3a" opacity="0.8" />
      <ellipse cx="64" cy="54" rx="5.5" ry="3" fill="#8a5a3a" opacity="0.8" />
      <ellipse cx="42" cy="82" rx="4.5" ry="3" fill="#8a5a3a" opacity="0.8" />
      <ellipse cx="86" cy="76" rx="3.5" ry="2" fill="#8a5a3a" opacity="0.8" />

      {/* 
        3. Outer & Hole Borders (Only rendered on edges without adjacent tiles)
      */}
      {borderTop && (
        <>
          <rect x="-1" y="-1" width="102" height={borderWidth} fill="#3a1e10" />
          <line
            x1="-1"
            y1={innerLineOffset}
            x2="101"
            y2={innerLineOffset}
            stroke="#241108"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </>
      )}
      {borderBottom && (
        <>
          <rect x="-1" y={100 - borderWidth} width="102" height={borderWidth + 1} fill="#3a1e10" />
          <line
            x1="-1"
            y1={100 - innerLineOffset}
            x2="101"
            y2={100 - innerLineOffset}
            stroke="#241108"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </>
      )}
      {borderLeft && (
        <>
          <rect x="-1" y="-1" width={borderWidth} height="102" fill="#3a1e10" />
          <line
            x1={innerLineOffset}
            y1="-1"
            x2={innerLineOffset}
            y2="101"
            stroke="#241108"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </>
      )}
      {borderRight && (
        <>
          <rect x={100 - borderWidth} y="-1" width={borderWidth + 1} height="102" fill="#3a1e10" />
          <line
            x1={100 - innerLineOffset}
            y1="-1"
            x2={100 - innerLineOffset}
            y2="101"
            stroke="#241108"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </>
      )}
    </svg>
  );
}
