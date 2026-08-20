'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';

import type { VideoMetadata } from '../types';
import { formatBytes, formatTime } from '../utils/audio-processor';

// ----------------------------------------------------------------------

interface VideoInfoCardProps {
  metadata: VideoMetadata | null;
}

export function VideoInfoCard({ metadata }: VideoInfoCardProps) {
  if (!metadata) return null;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Name and size */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MovieRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
              {metadata.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatBytes(metadata.size)} · {metadata.type || 'video'}
            </Typography>
          </Box>
        </Box>

        {/* Badges / Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            size="small"
            icon={<AccessTimeRoundedIcon />}
            label={`길이: ${formatTime(metadata.duration)}`}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<AspectRatioRoundedIcon />}
            label={`${metadata.width} × ${metadata.height} (${metadata.aspectRatio})`}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<AudiotrackRoundedIcon />}
            label={metadata.hasAudio ? '오디오 트랙 포함' : '오디오 트랙 없음'}
            color={metadata.hasAudio ? 'success' : 'default'}
            variant="soft"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>
    </Card>
  );
}
