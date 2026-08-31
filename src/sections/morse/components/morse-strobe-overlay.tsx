'use client';

import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FlashlightOnRoundedIcon from '@mui/icons-material/FlashlightOnRounded';

import type { LampColorTheme } from './morse-signal-lamp';

// ----------------------------------------------------------------------

interface MorseStrobeOverlayProps {
  open: boolean;
  onClose: () => void;
  active: boolean;
  symbol?: string;
  colorTheme?: LampColorTheme;
  text?: string;
}

const STROBE_COLORS: Record<LampColorTheme, { onBg: string; textColor: string; name: string }> = {
  amber: { onBg: '#fbbf24', textColor: '#78350f', name: 'Amber' },
  red: { onBg: '#ef4444', textColor: '#ffffff', name: 'Emergency Red' },
  cyan: { onBg: '#06b6d4', textColor: '#083344', name: 'Neon Cyan' },
  white: { onBg: '#ffffff', textColor: '#0f172a', name: 'Strobe White' },
};

export function MorseStrobeOverlay({
  open,
  onClose,
  active,
  symbol = '',
  colorTheme = 'amber',
  text = '',
}: MorseStrobeOverlayProps) {
  const current = STROBE_COLORS[colorTheme] || STROBE_COLORS.amber;

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: active ? current.onBg : '#000000',
          transition: 'background-color 0.05s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          userSelect: 'none',
        },
      }}
    >
      {/* Top Bar with Exit */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
        }}
      >
        <Button
          variant="contained"
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={onClose}
          sx={{
            bgcolor: 'rgba(0,0,0,0.6)',
            color: '#ffffff',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
          }}
        >
          스트로브 닫기 (ESC)
        </Button>
      </Box>

      {/* Main Signal Display */}
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 600,
          color: active ? current.textColor : '#64748b',
          transition: 'color 0.05s ease',
        }}
      >
        <FlashlightOnRoundedIcon
          sx={{
            fontSize: { xs: 80, md: 120 },
            mb: 2,
            filter: active ? 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' : 'none',
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: { xs: '3rem', md: '5.5rem' },
            letterSpacing: 4,
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          {symbol ? (symbol === '.' ? '• DOT' : symbol === '-' ? '━ DASH' : symbol) : '···'}
        </Typography>

        {text && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              opacity: active ? 1 : 0.4,
              wordBreak: 'break-word',
            }}
          >
            {text}
          </Typography>
        )}

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 4,
            opacity: 0.6,
          }}
        >
          화면 전체가 모스 부호 타이밍에 맞춰 점멸합니다. 야간 조난 신호나 장거리 수신호로
          활용하세요.
        </Typography>
      </Box>
    </Dialog>
  );
}
