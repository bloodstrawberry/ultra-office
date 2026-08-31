'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { playBadukStoneSound } from '../../../lib/games/gameSounds';
import { type Point, type BoardGrid, type StoneColor } from '../../../lib/games/baduk/types';

interface BadukBoardProps {
  board: BoardGrid;
  boardSize?: number;
  playerColor?: StoneColor;
  lastMove?: Point | null;
  recommendedMoves?: { point: Point; score: number; reason: string }[];
  showLiberties?: boolean;
  libertiesMap?: number[][];
  showInfluence?: boolean;
  influenceMap?: number[][];
  disabled?: boolean;
  onPlaceStone?: (p: Point) => void;
}

export function BadukBoard({
  board,
  boardSize = 9,
  playerColor = 'B',
  lastMove,
  recommendedMoves = [],
  showLiberties = false,
  libertiesMap,
  showInfluence = false,
  influenceMap,
  disabled = false,
  onPlaceStone,
}: BadukBoardProps) {
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  const size = boardSize;
  const padding = 28;
  const cellSize = 42;
  const boardWidth = padding * 2 + (size - 1) * cellSize;
  const boardHeight = boardWidth;

  // Star points (화점) coordinates
  const getStarPoints = (s: number): Point[] => {
    if (s === 9) {
      return [
        { r: 2, c: 2 },
        { r: 2, c: 6 },
        { r: 6, c: 2 },
        { r: 6, c: 6 },
        { r: 4, c: 4 },
      ];
    }
    if (s === 19) {
      const idxs = [3, 9, 15];
      const pts: Point[] = [];
      for (const r of idxs) {
        for (const c of idxs) {
          pts.push({ r, c });
        }
      }
      return pts;
    }
    return [{ r: Math.floor(s / 2), c: Math.floor(s / 2) }];
  };

  const starPoints = getStarPoints(size);

  const handleCellClick = (r: number, c: number) => {
    if (disabled || board[r][c] !== null) return;
    playBadukStoneSound();
    onPlaceStone?.({ r, c });
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #d49b4b 0%, #b87d32 50%, #945d1f 100%)',
        border: '3px solid #6b4111',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.3)',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        style={{ display: 'block', cursor: disabled ? 'default' : 'crosshair' }}
        onMouseLeave={() => setHoverPoint(null)}
      >
        <defs>
          {/* Black stone gradient */}
          <radialGradient id="blackStoneGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="35%" stopColor="#2d3748" />
            <stop offset="85%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0b0f19" />
          </radialGradient>

          {/* White stone gradient */}
          <radialGradient id="whiteStoneGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f7fafc" />
            <stop offset="80%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e0" />
          </radialGradient>

          {/* Stone Drop Shadow */}
          <filter id="stoneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="2"
              dy="3"
              stdDeviation="2.5"
              floodColor="#000000"
              floodOpacity="0.45"
            />
          </filter>
        </defs>

        {/* 1. Grid Lines */}
        {Array.from({ length: size }).map((_, i) => {
          const pos = padding + i * cellSize;
          return (
            <React.Fragment key={`grid-${i}`}>
              {/* Horizontal Line */}
              <line
                x1={padding}
                y1={pos}
                x2={padding + (size - 1) * cellSize}
                y2={pos}
                stroke="#5c3810"
                strokeWidth={i === 0 || i === size - 1 ? 2.2 : 1.2}
              />
              {/* Vertical Line */}
              <line
                x1={pos}
                y1={padding}
                x2={pos}
                y2={padding + (size - 1) * cellSize}
                stroke="#5c3810"
                strokeWidth={i === 0 || i === size - 1 ? 2.2 : 1.2}
              />
            </React.Fragment>
          );
        })}

        {/* 2. Star Points (화점) */}
        {starPoints.map((sp) => (
          <circle
            key={`star-${sp.r}-${sp.c}`}
            cx={padding + sp.c * cellSize}
            cy={padding + sp.r * cellSize}
            r={3.8}
            fill="#5c3810"
          />
        ))}

        {/* 3. Influence territory heatmap overlay */}
        {showInfluence &&
          influenceMap &&
          Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((__, c) => {
              const inf = influenceMap[r]?.[c] || 0;
              if (Math.abs(inf) < 0.15) return null;
              const isBlackDom = inf > 0;
              const alpha = Math.min(0.65, Math.abs(inf) * 0.7);
              return (
                <circle
                  key={`inf-${r}-${c}`}
                  cx={padding + c * cellSize}
                  cy={padding + r * cellSize}
                  r={cellSize * 0.38}
                  fill={isBlackDom ? '#000000' : '#ffffff'}
                  fillOpacity={alpha}
                  stroke={isBlackDom ? '#3b82f6' : '#ec4899'}
                  strokeWidth={1}
                />
              );
            })
          )}

        {/* 4. Clickable grid intersection hitboxes & Hover preview */}
        {Array.from({ length: size }).map((_, r) =>
          Array.from({ length: size }).map((__, c) => {
            const stone = board[r]?.[c];
            const cx = padding + c * cellSize;
            const cy = padding + r * cellSize;
            const stoneRadius = cellSize * 0.46;

            const isLast = lastMove && lastMove.r === r && lastMove.c === c;
            const isHover =
              !disabled && !stone && hoverPoint && hoverPoint.r === r && hoverPoint.c === c;
            const recommended = recommendedMoves.find((rm) => rm.point.r === r && rm.point.c === c);

            return (
              <g
                key={`cell-${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onMouseEnter={() => !disabled && !stone && setHoverPoint({ r, c })}
                style={{ cursor: stone ? 'default' : disabled ? 'default' : 'pointer' }}
              >
                {/* Invisible larger hit target */}
                <rect
                  x={cx - cellSize / 2}
                  y={cy - cellSize / 2}
                  width={cellSize}
                  height={cellSize}
                  fill="transparent"
                />

                {/* Hover Ghost Stone */}
                {isHover && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius}
                    fill={playerColor === 'B' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)'}
                    stroke={playerColor === 'B' ? '#60a5fa' : '#38bdf8'}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                )}

                {/* Existing Placed Stone */}
                {stone && (
                  <g filter="url(#stoneShadow)">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={stoneRadius}
                      fill={stone === 'B' ? 'url(#blackStoneGrad)' : 'url(#whiteStoneGrad)'}
                      stroke={stone === 'B' ? '#111827' : '#94a3b8'}
                      strokeWidth={1}
                    />

                    {/* Last Move Ring Indicator */}
                    {isLast && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={stoneRadius * 0.42}
                        fill="none"
                        stroke={stone === 'B' ? '#ef4444' : '#dc2626'}
                        strokeWidth={2.5}
                      />
                    )}

                    {/* Liberty number overlay */}
                    {showLiberties && libertiesMap && libertiesMap[r]?.[c] !== undefined && (
                      <text
                        x={cx}
                        y={cy + 4.5}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight="800"
                        fill={stone === 'B' ? '#67e8f9' : '#0f172a'}
                      >
                        {libertiesMap[r][c]}
                      </text>
                    )}
                  </g>
                )}

                {/* AI Recommended Move Marker */}
                {recommended && !stone && (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={stoneRadius * 0.75}
                      fill="rgba(59, 130, 246, 0.35)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <circle cx={cx} cy={cy} r={3.5} fill="#60a5fa" />
                  </g>
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Coordinate Labels */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          px: 1,
          mt: 0.5,
          color: '#5c3810',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <span>A ~ {String.fromCharCode(64 + size)}</span>
        <span>1 ~ {size}</span>
      </Box>
    </Paper>
  );
}
