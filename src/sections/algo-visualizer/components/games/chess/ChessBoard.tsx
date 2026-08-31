'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { playChessMoveSound } from '../../../lib/games/gameSounds';
import { isSameSquare, getPieceRawChessMoves } from '../../../lib/games/chess/engine';
import {
  type ChessColor,
  type ChessBoard as ChessBoardType,
  type ChessSquare,
  type ChessPiece,
} from '../../../lib/games/chess/types';

interface ChessBoardProps {
  board: ChessBoardType;
  playerColor?: ChessColor;
  selectedSquare?: ChessSquare | null;
  lastMove?: { from: ChessSquare; to: ChessSquare } | null;
  isCheck?: boolean;
  disabled?: boolean;
  onSelectSquare?: (sq: ChessSquare | null) => void;
  onMovePiece?: (from: ChessSquare, to: ChessSquare) => void;
}

export function ChessBoard({
  board,
  playerColor = 'w',
  selectedSquare,
  lastMove,
  isCheck = false,
  disabled = false,
  onSelectSquare,
  onMovePiece,
}: ChessBoardProps) {
  const [hoverSquare, setHoverSquare] = useState<ChessSquare | null>(null);

  const cellSize = 54;
  const boardSize = cellSize * 8;

  const validDests = selectedSquare ? getPieceRawChessMoves(board, selectedSquare) : [];

  const handleSquareClick = (r: number, c: number) => {
    if (disabled) return;
    const clickedPiece = board[r][c];

    if (selectedSquare) {
      const isTarget = validDests.some((vd) => vd.r === r && vd.c === c);
      if (isTarget) {
        playChessMoveSound();
        onMovePiece?.(selectedSquare, { r, c });
        onSelectSquare?.(null);
        return;
      }

      if (clickedPiece && clickedPiece.color === playerColor) {
        onSelectSquare?.({ r, c });
        return;
      }

      onSelectSquare?.(null);
    } else {
      if (clickedPiece && clickedPiece.color === playerColor) {
        onSelectSquare?.({ r, c });
      }
    }
  };

  const renderPieceSVG = (piece: ChessPiece, cx: number, cy: number) => {
    const isWhite = piece.color === 'w';
    const fill = isWhite ? '#ffffff' : '#1e293b';
    const stroke = isWhite ? '#334155' : '#0f172a';
    const shadowColor = isWhite ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)';

    const pieceSymbols: Record<string, string> = {
      k: '♚',
      q: '♛',
      r: '♜',
      b: '♝',
      n: '♞',
      p: '♟',
    };

    return (
      <g>
        {/* Soft shadow */}
        <text
          x={cx + 1}
          y={cy + 13 + 1}
          textAnchor="middle"
          fontSize={38}
          fill={shadowColor}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {pieceSymbols[piece.type]}
        </text>
        {/* Piece Icon */}
        <text
          x={cx}
          y={cy + 13}
          textAnchor="middle"
          fontSize={38}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.8}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {pieceSymbols[piece.type]}
        </text>
      </g>
    );
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#1e293b',
        border: '3px solid #334155',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        userSelect: 'none',
      }}
    >
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }}
        onMouseLeave={() => setHoverSquare(null)}
      >
        {/* 1. Squares */}
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((__, c) => {
            const isDark = (r + c) % 2 === 1;
            const x = c * cellSize;
            const y = r * cellSize;
            const piece = board[r][c];

            const isSelected = isSameSquare(selectedSquare, { r, c });
            const isLastFrom = lastMove && isSameSquare(lastMove.from, { r, c });
            const isLastTo = lastMove && isSameSquare(lastMove.to, { r, c });
            const isValidDest = validDests.some((vd) => vd.r === r && vd.c === c);

            let squareColor = isDark ? '#b58863' : '#f0d9b5';
            if (isSelected) squareColor = '#7dd3fc';
            else if (isLastFrom || isLastTo) squareColor = isDark ? '#ced26b' : '#f5f682';

            return (
              <g
                key={`sq-${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                onMouseEnter={() => !disabled && setHoverSquare({ r, c })}
              >
                {/* Board Square */}
                <rect x={x} y={y} width={cellSize} height={cellSize} fill={squareColor} />

                {/* Algebraic Coordinates */}
                {c === 0 && (
                  <text
                    x={x + 3}
                    y={y + 12}
                    fontSize={10}
                    fontWeight="700"
                    fill={isDark ? '#f0d9b5' : '#b58863'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {8 - r}
                  </text>
                )}
                {r === 7 && (
                  <text
                    x={x + cellSize - 10}
                    y={y + cellSize - 3}
                    fontSize={10}
                    fontWeight="700"
                    fill={isDark ? '#f0d9b5' : '#b58863'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {String.fromCharCode(97 + c)}
                  </text>
                )}

                {/* Valid Move Destination Dot / Capture Ring */}
                {isValidDest && (
                  <circle
                    cx={x + cellSize / 2}
                    cy={y + cellSize / 2}
                    r={piece ? cellSize * 0.42 : 7}
                    fill={piece ? 'transparent' : 'rgba(30, 41, 59, 0.35)'}
                    stroke={piece ? '#ef4444' : 'none'}
                    strokeWidth={piece ? 3 : 0}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Piece */}
                {piece && renderPieceSVG(piece, x + cellSize / 2, y + cellSize / 2)}
              </g>
            );
          })
        )}
      </svg>

      {/* Footer labels */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          px: 1,
          mt: 0.5,
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <span>a ~ h</span>
        <span>1 ~ 8</span>
      </Box>
    </Paper>
  );
}
