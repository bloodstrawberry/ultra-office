'use client';

import type { TelemetryStats } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface StatsHUDProps {
  stats: TelemetryStats;
}

export function StatsHUD({ stats }: StatsHUDProps) {
  const fpsColor = stats.fps >= 55 ? '#22c55e' : stats.fps >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 10,
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 1.5,
        px: 1.5,
        py: 1,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          FPS:
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: fpsColor, fontWeight: 900, fontFamily: 'monospace' }}
        >
          {stats.fps}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          ({stats.frameTime.toFixed(1)} ms)
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.7rem' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Draws:
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}
          >
            {stats.drawCalls}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Triangles:
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#a855f7', fontWeight: 700, fontFamily: 'monospace' }}
          >
            {stats.triangles.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
