'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { playJanggiPieceSound } from '../../../lib/games/gameSounds';
import {
  JANGGI_ROWS,
  JANGGI_COLS,
  getPieceRawMoves,
  isSameJanggiPoint,
} from '../../../lib/games/janggi/engine';
import {
  type JanggiSide,
  type JanggiPiece,
  type JanggiPoint,
  type JanggiBoard as JanggiBoardType,
} from '../../../lib/games/janggi/types';

interface JanggiBoardProps {
  board: JanggiBoardType;
  playerSide?: JanggiSide;
  selectedPoint?: JanggiPoint | null;
  lastMove?: { from: JanggiPoint; to: JanggiPoint } | null;
  isCheck?: boolean;
  disabled?: boolean;
  onSelectPoint?: (p: JanggiPoint | null) => void;
  onMovePiece?: (from: JanggiPoint, to: JanggiPoint) => void;
}

export function JanggiBoard({
  board,
  playerSide = 'CHO',
  selectedPoint,
  lastMove,
  isCheck = false,
  disabled = false,
  onSelectPoint,
  onMovePiece,
}: JanggiBoardProps) {
  const [hoverPoint, setHoverPoint] = useState<JanggiPoint | null>(null);

  const paddingX = 36;
  const paddingY = 36;
  const cellWidth = 46;
  const cellHeight = 46;

  const boardWidth = paddingX * 2 + (JANGGI_COLS - 1) * cellWidth;
  const boardHeight = paddingY * 2 + (JANGGI_ROWS - 1) * cellHeight;

  // Compute legal destination and blocked points for selected piece
  const { validPoints, blockedPoints } = selectedPoint
    ? getPieceRawMoves(board, selectedPoint.r, selectedPoint.c, true)
    : { validPoints: [], blockedPoints: [] };

  const handleIntersectionClick = (r: number, c: number) => {
    if (disabled) return;
    const clickedPiece = board[r][c];

    if (selectedPoint) {
      // Check if clicking valid destination
      const isTarget = validPoints.some((vp) => vp.r === r && vp.c === c);
      if (isTarget) {
        playJanggiPieceSound();
        onMovePiece?.(selectedPoint, { r, c });
        onSelectPoint?.(null);
        return;
      }

      // If clicking own piece, switch selection
      if (clickedPiece && clickedPiece.side === playerSide) {
        onSelectPoint?.({ r, c });
        return;
      }

      // Deselect
      onSelectPoint?.(null);
    } else {
      // Select own piece
      if (clickedPiece && clickedPiece.side === playerSide) {
        onSelectPoint?.({ r, c });
      }
    }
  };

  const getHanjaLabel = (piece: JanggiPiece): string => {
    if (piece.side === 'CHO') {
      switch (piece.type) {
        case 'KING':
          return '楚';
        case 'GUARD':
          return '士';
        case 'CHARIOT':
          return '車';
        case 'CANNON':
          return '包';
        case 'HORSE':
          return '馬';
        case 'ELEPHANT':
          return '象';
        case 'SOLDIER':
          return '卒';
      }
    } else {
      switch (piece.type) {
        case 'KING':
          return '漢';
        case 'GUARD':
          return '士';
        case 'CHARIOT':
          return '車';
        case 'CANNON':
          return '包';
        case 'HORSE':
          return '馬';
        case 'ELEPHANT':
          return '象';
        case 'SOLDIER':
          return '兵';
      }
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #deb887 0%, #c49a60 50%, #9e743d 100%)',
        border: '3px solid #5c3c1a',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.3)',
        userSelect: 'none',
      }}
    >
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }}
        onMouseLeave={() => setHoverPoint(null)}
      >
        <defs>
          {/* Piece Wooden Radial Gradient */}
          <radialGradient id="janggiWoodGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fffdfa" />
            <stop offset="40%" stopColor="#f7f0e4" />
            <stop offset="85%" stopColor="#decfb8" />
            <stop offset="100%" stopColor="#bfa98e" />
          </radialGradient>

          {/* Piece Shadow */}
          <filter id="janggiPieceShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="1.5"
              dy="2.5"
              stdDeviation="2"
              floodColor="#000000"
              floodOpacity="0.4"
            />
          </filter>
        </defs>

        {/* 1. Horizontal Lines */}
        {Array.from({ length: JANGGI_ROWS }).map((_, r) => {
          const y = paddingY + r * cellHeight;
          return (
            <line
              key={`h-line-${r}`}
              x1={paddingX}
              y1={y}
              x2={paddingX + (JANGGI_COLS - 1) * cellWidth}
              y2={y}
              stroke="#5c3810"
              strokeWidth={r === 0 || r === JANGGI_ROWS - 1 ? 2.5 : 1.3}
            />
          );
        })}

        {/* 2. Vertical Lines */}
        {Array.from({ length: JANGGI_COLS }).map((_, c) => {
          const x = paddingX + c * cellWidth;
          return (
            <line
              key={`v-line-${c}`}
              x1={x}
              y1={paddingY}
              x2={x}
              y2={paddingY + (JANGGI_ROWS - 1) * cellHeight}
              stroke="#5c3810"
              strokeWidth={c === 0 || c === JANGGI_COLS - 1 ? 2.5 : 1.3}
            />
          );
        })}

        {/* 3. Han Palace Diagonals (Top) */}
        <line
          x1={paddingX + 3 * cellWidth}
          y1={paddingY + 0 * cellHeight}
          x2={paddingX + 5 * cellWidth}
          y2={paddingY + 2 * cellHeight}
          stroke="#5c3810"
          strokeWidth={1.3}
        />
        <line
          x1={paddingX + 5 * cellWidth}
          y1={paddingY + 0 * cellHeight}
          x2={paddingX + 3 * cellWidth}
          y2={paddingY + 2 * cellHeight}
          stroke="#5c3810"
          strokeWidth={1.3}
        />

        {/* 4. Cho Palace Diagonals (Bottom) */}
        <line
          x1={paddingX + 3 * cellWidth}
          y1={paddingY + 7 * cellHeight}
          x2={paddingX + 5 * cellWidth}
          y2={paddingY + 9 * cellHeight}
          stroke="#5c3810"
          strokeWidth={1.3}
        />
        <line
          x1={paddingX + 5 * cellWidth}
          y1={paddingY + 7 * cellHeight}
          x2={paddingX + 3 * cellWidth}
          y2={paddingY + 9 * cellHeight}
          stroke="#5c3810"
          strokeWidth={1.3}
        />

        {/* 5. Last Move Trail Arrow */}
        {lastMove && (
          <line
            x1={paddingX + lastMove.from.c * cellWidth}
            y1={paddingY + lastMove.from.r * cellHeight}
            x2={paddingX + lastMove.to.c * cellWidth}
            y2={paddingY + lastMove.to.r * cellHeight}
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth={3}
            strokeDasharray="4 4"
          />
        )}

        {/* 6. Pieces & Click Handlers */}
        {Array.from({ length: JANGGI_ROWS }).map((_, r) =>
          Array.from({ length: JANGGI_COLS }).map((__, c) => {
            const piece = board[r][c];
            const cx = paddingX + c * cellWidth;
            const cy = paddingY + r * cellHeight;
            const isSelected = isSameJanggiPoint(selectedPoint, { r, c });
            const isValidDest = validPoints.some((vp) => vp.r === r && vp.c === c);
            const isBlockedMyeok = blockedPoints?.some((bp) => bp.r === r && bp.c === c);

            const pieceRadius = piece?.type === 'KING' ? 20 : 17;
            const isCho = piece?.side === 'CHO';

            return (
              <g
                key={`janggi-cell-${r}-${c}`}
                onClick={() => handleIntersectionClick(r, c)}
                onMouseEnter={() => !disabled && setHoverPoint({ r, c })}
              >
                {/* Hitbox */}
                <rect
                  x={cx - cellWidth / 2}
                  y={cy - cellHeight / 2}
                  width={cellWidth}
                  height={cellHeight}
                  fill="transparent"
                />

                {/* Valid Move Destination Indicator Dot / Ring */}
                {isValidDest && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={piece ? pieceRadius + 3 : 7}
                    fill={piece ? 'rgba(239, 68, 68, 0.35)' : '#3b82f6'}
                    stroke={piece ? '#ef4444' : '#60a5fa'}
                    strokeWidth={2}
                    fillOpacity={0.8}
                  />
                )}

                {/* Blocked Myeok indicator (X marker) */}
                {isBlockedMyeok && (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="rgba(239, 68, 68, 0.2)"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={cx - 3}
                      y1={cy - 3}
                      x2={cx + 3}
                      y2={cy + 3}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={cx + 3}
                      y1={cy - 3}
                      x2={cx - 3}
                      y2={cy + 3}
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                  </g>
                )}

                {/* Piece Rendering */}
                {piece && (
                  <g filter="url(#janggiPieceShadow)">
                    {/* Selected piece highlight halo */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={pieceRadius + 4}
                        fill="rgba(59, 130, 246, 0.3)"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                      />
                    )}

                    {/* Octagonal / Circle Wood Piece Disc */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={pieceRadius}
                      fill="url(#janggiWoodGrad)"
                      stroke="#8c6a43"
                      strokeWidth={1.5}
                    />

                    {/* Inner Calligraphy Inscription Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={pieceRadius - 3}
                      fill="none"
                      stroke={isCho ? 'rgba(5, 150, 105, 0.4)' : 'rgba(220, 38, 38, 0.4)'}
                      strokeWidth={0.8}
                    />

                    {/* Traditional Hanja Character */}
                    <text
                      x={cx}
                      y={cy + (piece.type === 'KING' ? 6 : 5.5)}
                      textAnchor="middle"
                      fontSize={piece.type === 'KING' ? 18 : 15}
                      fontWeight="900"
                      fontFamily="'Batang', 'Gungsuh', 'Songti SC', serif"
                      fill={isCho ? '#065f46' : '#b91c1c'}
                    >
                      {getHanjaLabel(piece)}
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Coordinate & Palace guide */}
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
        <span>漢 (한나라 진영)</span>
        <span>楚 (초나라 진영)</span>
      </Box>
    </Paper>
  );
}
