'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { GOMOKU_SIZE } from '../../../lib/games/gomoku/engine';
import {
  type GomokuGrid,
  type GomokuPoint,
  type GomokuColor,
  type GomokuWinLine,
} from '../../../lib/games/gomoku/types';

interface GomokuBoardProps {
  board: GomokuGrid;
  playerColor?: GomokuColor;
  lastMove?: GomokuPoint | null;
  winLine?: GomokuWinLine | null;
  recommendedMoves?: { move: GomokuPoint; score: number }[];
  disabled?: boolean;
  onPlaceStone: (point: GomokuPoint) => void;
}

const STAR_POINTS: [number, number][] = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
];

export function GomokuBoard({
  board,
  playerColor = 'B',
  lastMove,
  winLine,
  recommendedMoves,
  disabled = false,
  onPlaceStone,
}: GomokuBoardProps) {
  const isWinPoint = (r: number, c: number) =>
    winLine?.points.some((p) => p.r === r && p.c === c) ?? false;

  const isRecommended = (r: number, c: number) =>
    recommendedMoves?.some((rm) => rm.move.r === r && rm.move.c === c) ?? false;

  const isStarPoint = (r: number, c: number) =>
    STAR_POINTS.some(([sr, sc]) => sr === r && sc === c);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        p: { xs: 1, sm: 2 },
        bgcolor: '#ca8a04',
        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
        border: '4px solid #78350f',
      }}
    >
      {/* Top Column Labels (A-O) */}
      <Box
        sx={{
          display: 'flex',
          pl: 3,
          pr: 1,
          mb: 0.5,
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].map((col) => (
          <Typography
            key={col}
            sx={{
              width: { xs: 20, sm: 26 },
              textAlign: 'center',
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              fontWeight: 800,
              color: '#fef3c7',
            }}
          >
            {col}
          </Typography>
        ))}
      </Box>

      {/* Main Grid Area with Row Numbers */}
      <Box sx={{ display: 'flex' }}>
        {/* Left Row Labels (1-15) */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pr: 1 }}
        >
          {Array.from({ length: GOMOKU_SIZE }, (_, i) => i + 1).map((row) => (
            <Typography
              key={row}
              sx={{
                height: { xs: 20, sm: 26 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                fontWeight: 800,
                color: '#fef3c7',
                width: 16,
              }}
            >
              {row}
            </Typography>
          ))}
        </Box>

        {/* 15x15 Board Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GOMOKU_SIZE}, 1fr)`,
            bgcolor: '#eab308',
            background: 'radial-gradient(circle at center, #facc15, #ca8a04)',
            p: 0.5,
            borderRadius: 1.5,
            border: '2px solid #78350f',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLast = lastMove && lastMove.r === r && lastMove.c === c;
              const isWin = isWinPoint(r, c);
              const isRec = isRecommended(r, c);
              const isStar = isStarPoint(r, c);

              return (
                <Box
                  key={`${r}-${c}`}
                  onClick={() => !disabled && !cell && onPlaceStone({ r, c })}
                  sx={{
                    width: { xs: 20, sm: 26 },
                    height: { xs: 20, sm: 26 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled || cell ? 'default' : 'pointer',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: !disabled && !cell ? 'rgba(255, 255, 255, 0.2)' : undefined,
                    },
                  }}
                >
                  {/* Grid Cross Lines */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: c === 0 ? '50%' : 0,
                      right: c === GOMOKU_SIZE - 1 ? '50%' : 0,
                      height: '1px',
                      bgcolor: '#78350f',
                      zIndex: 1,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: r === 0 ? '50%' : 0,
                      bottom: r === GOMOKU_SIZE - 1 ? '50%' : 0,
                      width: '1px',
                      bgcolor: '#78350f',
                      zIndex: 1,
                    }}
                  />

                  {/* Star Point Marker */}
                  {isStar && !cell && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: '#78350f',
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Stone */}
                  {cell && (
                    <Box
                      sx={{
                        width: { xs: 17, sm: 22 },
                        height: { xs: 17, sm: 22 },
                        borderRadius: '50%',
                        bgcolor: cell === 'B' ? '#0f172a' : '#f8fafc',
                        background:
                          cell === 'B'
                            ? 'radial-gradient(circle at 35% 35%, #334155, #020617)'
                            : 'radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1)',
                        boxShadow: isWin
                          ? '0 0 12px #22c55e, 0 4px 8px rgba(0,0,0,0.6)'
                          : cell === 'B'
                            ? '0 3px 6px rgba(0,0,0,0.5)'
                            : '0 3px 6px rgba(0,0,0,0.3)',
                        border: isWin
                          ? '2px solid #22c55e'
                          : cell === 'B'
                            ? '1px solid #1e293b'
                            : '1px solid #94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 3,
                        transform: isWin ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Last Move Indicator Ring */}
                      {isLast && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: cell === 'B' ? '#38bdf8' : '#e11d48',
                          }}
                        />
                      )}
                    </Box>
                  )}

                  {/* AI Recommended Hint Ghost */}
                  {!cell && isRec && !disabled && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#0284c7',
                        zIndex: 2,
                        boxShadow: '0 0 6px #0284c7',
                      }}
                    />
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
}
