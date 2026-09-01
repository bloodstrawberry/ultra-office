'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { OTHELLO_SIZE, getValidOthelloMoves } from '../../../lib/games/othello/engine';
import {
  type OthelloGrid,
  type OthelloPoint,
  type OthelloColor,
} from '../../../lib/games/othello/types';

interface OthelloBoardProps {
  board: OthelloGrid;
  playerColor: OthelloColor;
  lastMove?: OthelloPoint | null;
  disabled?: boolean;
  onPlaceDisc: (point: OthelloPoint) => void;
  showValidMoves?: boolean;
  highlightedMoves?: OthelloPoint[];
}

const STAR_POINTS: [number, number][] = [
  [2, 2],
  [2, 6],
  [6, 2],
  [6, 6],
];

export function OthelloBoard({
  board,
  playerColor,
  lastMove,
  disabled = false,
  onPlaceDisc,
  showValidMoves = true,
  highlightedMoves,
}: OthelloBoardProps) {
  const validMoves = React.useMemo(() => {
    if (disabled || !showValidMoves) return [];
    return getValidOthelloMoves(board, playerColor);
  }, [board, playerColor, disabled, showValidMoves]);

  const isValidMove = (r: number, c: number) => validMoves.some((m) => m.r === r && m.c === c);

  const isHighlighted = (r: number, c: number) =>
    highlightedMoves?.some((m) => m.r === r && m.c === c) ?? false;

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
        bgcolor: '#14532d',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
        border: '4px solid #0f391f',
      }}
    >
      {/* Top Column Labels (A-H) */}
      <Box
        sx={{
          display: 'flex',
          pl: 3.5,
          pr: 1,
          mb: 0.5,
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((col) => (
          <Typography
            key={col}
            sx={{
              width: { xs: 36, sm: 46 },
              textAlign: 'center',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              fontWeight: 800,
              color: '#86efac',
            }}
          >
            {col}
          </Typography>
        ))}
      </Box>

      {/* Main Grid Area with Row Numbers */}
      <Box sx={{ display: 'flex' }}>
        {/* Left Row Labels (1-8) */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pr: 1 }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8'].map((row) => (
            <Typography
              key={row}
              sx={{
                height: { xs: 36, sm: 46 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                fontWeight: 800,
                color: '#86efac',
                width: 18,
              }}
            >
              {row}
            </Typography>
          ))}
        </Box>

        {/* 8x8 Board Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${OTHELLO_SIZE}, 1fr)`,
            bgcolor: '#15803d',
            p: 0.5,
            borderRadius: 1.5,
            border: '2px solid #0f391f',
            gap: '2px',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isLast = lastMove && lastMove.r === r && lastMove.c === c;
              const isLegal = isValidMove(r, c);
              const isHigh = isHighlighted(r, c);
              const isStar = isStarPoint(r, c);

              return (
                <Box
                  key={`${r}-${c}`}
                  onClick={() => !disabled && onPlaceDisc({ r, c })}
                  sx={{
                    width: { xs: 36, sm: 46 },
                    height: { xs: 36, sm: 46 },
                    bgcolor: isHigh ? 'rgba(234, 179, 8, 0.25)' : '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled ? 'default' : isLegal ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isLegal && !disabled ? '#1e7e44' : undefined,
                    },
                  }}
                >
                  {/* Star Point Marker */}
                  {isStar && !cell && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#0f391f',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Disc */}
                  {cell && (
                    <Box
                      sx={{
                        width: { xs: 28, sm: 36 },
                        height: { xs: 28, sm: 36 },
                        borderRadius: '50%',
                        bgcolor: cell === 'B' ? '#0f172a' : '#f8fafc',
                        background:
                          cell === 'B'
                            ? 'radial-gradient(circle at 35% 35%, #334155, #0f172a)'
                            : 'radial-gradient(circle at 35% 35%, #ffffff, #e2e8f0)',
                        boxShadow:
                          cell === 'B'
                            ? '0 4px 8px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(0,0,0,0.4)'
                            : '0 4px 8px rgba(0,0,0,0.35), inset 0 -2px 4px rgba(0,0,0,0.15)',
                        border: cell === 'B' ? '1px solid #1e293b' : '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2,
                        transform: 'scale(1)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      {/* Last Move Ring Indicator */}
                      {isLast && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: cell === 'B' ? '#38bdf8' : '#e11d48',
                            boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                          }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Valid Move Ghost Dot */}
                  {!cell && isLegal && !disabled && (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor:
                          playerColor === 'B'
                            ? 'rgba(15, 23, 42, 0.4)'
                            : 'rgba(255, 255, 255, 0.55)',
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.3)',
                        },
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
