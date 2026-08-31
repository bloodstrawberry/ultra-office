'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';

// ----------------------------------------------------------------------

export type LampColorTheme = 'amber' | 'red' | 'cyan' | 'white';

interface MorseSignalLampProps {
  active: boolean;
  symbol?: string; // '.', '-', ' '
  colorTheme?: LampColorTheme;
  onOpenStrobe?: () => void;
  title?: string;
  subtitle?: string;
}

const THEME_COLORS: Record<LampColorTheme, { main: string; glow: string; label: string }> = {
  amber: { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)', label: '앰버 골드' },
  red: { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)', label: '비상 적색' },
  cyan: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.85)', label: '네온 시안' },
  white: { main: '#f8fafc', glow: 'rgba(248, 250, 252, 0.95)', label: '하이 화이트' },
};

export function MorseSignalLamp({
  active,
  symbol = '',
  colorTheme = 'amber',
  onOpenStrobe,
  title = '광학 시각 신호등',
  subtitle = '모스 부호 전송 시 불빛 신호가 실시간 점멸합니다.',
}: MorseSignalLampProps) {
  const currentTheme = THEME_COLORS[colorTheme] || THEME_COLORS.amber;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightModeRoundedIcon
            sx={{
              fontSize: 20,
              color: active ? currentTheme.main : 'text.secondary',
              transition: 'color 0.1s ease',
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip
            size="small"
            label={active ? (symbol === '-' ? 'DASH (선)' : 'DOT (점)') : 'STANDBY'}
            color={active ? 'warning' : 'default'}
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 20,
              transition: 'all 0.1s ease',
            }}
          />
        </Box>

        {onOpenStrobe && (
          <Tooltip title="전체화면 스트로브 / 플래시 모드 (야간 조난 신호용)">
            <IconButton
              size="small"
              onClick={onOpenStrobe}
              sx={{
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <FullscreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Lamp Centerpiece */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2.5,
          position: 'relative',
        }}
      >
        {/* Glow Halo Backdrop */}
        <Box
          sx={{
            width: { xs: 84, md: 104 },
            height: { xs: 84, md: 104 },
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: active ? currentTheme.main : 'background.neutral',
            border: (theme) => `4px solid ${theme.palette.divider}`,
            boxShadow: active
              ? `0 0 35px 12px ${currentTheme.glow}, inset 0 0 20px rgba(255,255,255,0.7)`
              : 'inset 0 2px 6px rgba(0,0,0,0.15)',
            transform: active ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <FlashOnRoundedIcon
            sx={{
              fontSize: { xs: 44, md: 54 },
              color: active ? '#ffffff' : 'text.disabled',
              filter: active ? 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' : 'none',
              transition: 'all 0.08s ease',
            }}
          />
        </Box>

        {/* Current Symbol Display */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 900,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: active ? currentTheme.main : 'text.disabled',
              textShadow: active ? `0 0 10px ${currentTheme.glow}` : 'none',
            }}
          >
            {symbol ? (symbol === '.' ? '• (DOT)' : symbol === '-' ? '━ (DASH)' : symbol) : '---'}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
