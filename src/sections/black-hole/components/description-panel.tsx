'use client';

import type { BlackHoleConfig } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { getModeExplanationText, classifyImpactScenario } from '../physics-engine';

// ----------------------------------------------------------------------

interface DescriptionPanelProps {
  config: BlackHoleConfig;
}

export function DescriptionPanel({ config }: DescriptionPanelProps) {
  const scenario = classifyImpactScenario(config.impactParameter);
  const info = getModeExplanationText(
    config.activeMode,
    config.mass,
    config.impactParameter,
    scenario
  );

  return (
    <Card
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        width: 'calc(100% - 32px)',
        maxWidth: 720,
        p: 2,
        borderRadius: 3,
        backdropFilter: 'blur(16px)',
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
        color: '#F8FAFC',
        pointerEvents: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
          pb: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#67E8F9',
              boxShadow: '0 0 8px #67E8F9',
              animation: 'ping 1.5s infinite',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #38BDF8 0%, #67E8F9 50%, #A5B4FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {info.title}
          </Typography>
        </Box>

        <Chip
          label={info.badge}
          size="small"
          color={
            info.badgeColor === 'primary'
              ? 'primary'
              : info.badgeColor === 'info'
                ? 'info'
                : info.badgeColor === 'warning'
                  ? 'warning'
                  : info.badgeColor === 'error'
                    ? 'error'
                    : 'secondary'
          }
          sx={{ fontWeight: 800, fontSize: '0.7rem' }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: '#CBD5E1',
          lineHeight: 1.6,
          display: 'block',
          fontSize: { xs: '0.72rem', sm: '0.78rem' },
        }}
      >
        {info.desc}
      </Typography>
    </Card>
  );
}
