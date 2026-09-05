'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { type SemaphoreItem } from '../utils/semaphore-data';

// ----------------------------------------------------------------------

interface SemaphoreFlagCanvasProps {
  item: SemaphoreItem;
  size?: number;
}

export function SemaphoreFlagCanvas({ item, size = 120 }: SemaphoreFlagCanvasProps) {
  // Center is (50, 50)
  // Left arm pivot: (44, 46), Right arm pivot: (56, 46)
  const armLen = 32;

  // Convert angles (0 = Up, 90 = Right, 180 = Down, 270 = Left) to standard rad
  const leftRad = ((item.leftArmAngle - 90) * Math.PI) / 180;
  const rightRad = ((item.rightArmAngle - 90) * Math.PI) / 180;

  const leftX = 50 + armLen * Math.cos(leftRad);
  const leftY = 46 + armLen * Math.sin(leftRad);

  const rightX = 50 + armLen * Math.cos(rightRad);
  const rightY = 46 + armLen * Math.sin(rightRad);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
        borderRadius: 2,
        p: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'relative',
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Signalman Head & Torso */}
        <circle cx="50" cy="30" r="8" fill="#475569" />
        <rect x="44" y="38" width="12" height="26" rx="3" fill="#1e293b" />
        {/* Legs */}
        <line
          x1="47"
          y1="64"
          x2="44"
          y2="86"
          stroke="#1e293b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="53"
          y1="64"
          x2="56"
          y2="86"
          stroke="#1e293b"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Left Arm & Flag (Red & Yellow Semaphore Flag) */}
        <line
          x1="46"
          y1="42"
          x2={leftX}
          y2={leftY}
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={leftX} cy={leftY} r="7" fill="#ef4444" stroke="#fbbf24" strokeWidth="3" />

        {/* Right Arm & Flag */}
        <line
          x1="54"
          y1="42"
          x2={rightX}
          y2={rightY}
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={rightX} cy={rightY} r="7" fill="#fbbf24" stroke="#ef4444" strokeWidth="3" />
      </svg>

      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', mt: -0.5 }}>
        {item.char}
      </Typography>
    </Box>
  );
}
