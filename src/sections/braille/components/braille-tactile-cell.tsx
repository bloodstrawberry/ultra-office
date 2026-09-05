'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { brailleCharToDots } from '../utils/braille-core';

// ----------------------------------------------------------------------

interface BrailleTactileCellProps {
  char: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  onDotClick?: (dotNum: number) => void;
  interactive?: boolean;
}

export function BrailleTactileCell({
  char,
  label,
  size = 'medium',
  onDotClick,
  interactive = false,
}: BrailleTactileCellProps) {
  const activeDots = brailleCharToDots(char);

  const dim =
    size === 'small'
      ? { w: 32, h: 48, dot: 6, gap: 4 }
      : size === 'large'
        ? { w: 64, h: 96, dot: 14, gap: 8 }
        : { w: 44, h: 66, dot: 9, gap: 6 };

  // 6-dot matrix layout:
  // Col 1: 1, 2, 3
  // Col 2: 4, 5, 6
  const dotMatrix = [
    [1, 4],
    [2, 5],
    [3, 6],
  ];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          width: dim.w,
          height: dim.h,
          p: 0.8,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.customShadows?.z1 || theme.shadows[1],
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          alignItems: 'center',
          justifyItems: 'center',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          '&:hover': interactive
            ? {
                borderColor: 'primary.main',
                boxShadow: (theme) => theme.customShadows?.z4,
              }
            : undefined,
        }}
      >
        {dotMatrix.map((row, rIdx) =>
          row.map((dotNum) => {
            const isActive = activeDots.includes(dotNum);

            return (
              <Box
                key={`dot-${dotNum}`}
                onClick={() => onDotClick?.(dotNum)}
                sx={{
                  width: dim.dot,
                  height: dim.dot,
                  borderRadius: '50%',
                  bgcolor: isActive ? 'primary.main' : 'action.disabledBackground',
                  boxShadow: isActive
                    ? '0 2px 4px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.6)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.1s ease',
                  cursor: interactive ? 'pointer' : 'default',
                }}
              />
            );
          })
        )}
      </Box>

      {label && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: size === 'small' ? '0.7rem' : '0.85rem',
            color: 'text.secondary',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
