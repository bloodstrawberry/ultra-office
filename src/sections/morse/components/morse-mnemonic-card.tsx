'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';

import { getSharedMorsePlayer } from '../utils/morse-audio';
import { type MorseMnemonicItem } from '../data/morse-mnemonics-data';

// ----------------------------------------------------------------------

interface MorseMnemonicCardProps {
  item: MorseMnemonicItem;
  onSelect?: (item: MorseMnemonicItem) => void;
}

export function MorseMnemonicCard({ item, onSelect }: MorseMnemonicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayer = getSharedMorsePlayer();

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    audioPlayer.stop();
    audioPlayer.load(item.morse, {
      onComplete: () => setIsPlaying(false),
    });
    audioPlayer.play();
  };

  return (
    <Card
      onClick={() => onSelect?.(item)}
      sx={{
        p: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z12 || theme.shadows[8],
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Top Play Action */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
        }}
      >
        <Tooltip title="소리 듣기">
          <IconButton
            size="small"
            onClick={handlePlaySound}
            color={isPlaying ? 'warning' : 'default'}
            sx={{
              bgcolor: isPlaying ? 'warning.lighter' : 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <VolumeUpRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Visual SVG Graphic: Letter Glyph with Dotted/Dashed Strokes */}
      <Box
        sx={{
          width: { xs: 90, sm: 100 },
          height: { xs: 90, sm: 100 },
          my: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          borderRadius: 2,
          p: 1,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Background Text Glyph Outline */}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fontSize="76"
            fontFamily="'Public Sans', 'Inter', sans-serif"
            fontWeight="900"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="3 3"
            opacity="0.25"
          >
            {item.letter}
          </text>

          {/* Render Morse Dashes (선) */}
          {item.dashes.map((dash, dIdx) => (
            <line
              key={`dash-${dIdx}`}
              x1={dash.x1}
              y1={dash.y1}
              x2={dash.x2}
              y2={dash.y2}
              stroke={isPlaying ? '#f59e0b' : '#0f172a'}
              strokeWidth={dash.width || 8}
              strokeLinecap="round"
              style={{
                transition: 'stroke 0.15s ease',
              }}
            />
          ))}

          {/* Render Morse Dots (점) */}
          {item.dots.map((dot, dotIdx) => (
            <circle
              key={`dot-${dotIdx}`}
              cx={dot.x}
              cy={dot.y}
              r={6.5}
              fill={isPlaying ? '#f59e0b' : '#0f172a'}
              style={{
                transition: 'fill 0.15s ease',
              }}
            />
          ))}
        </svg>
      </Box>

      {/* Letter Title & Morse Code */}
      <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5, lineHeight: 1 }}>
        {item.letter}
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 800,
          letterSpacing: 2,
          color: 'primary.main',
          my: 0.5,
        }}
      >
        {item.morse}
      </Typography>

      {/* Phonetic Pronunciation (English & Korean) */}
      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
          }}
        >
          {item.phoneticEn}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'primary.dark',
            fontSize: '0.8rem',
          }}
        >
          {item.phoneticKo}
        </Typography>
      </Box>
    </Card>
  );
}
