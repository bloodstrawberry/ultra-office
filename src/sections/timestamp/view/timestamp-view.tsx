'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { TimestampConverter } from '../components/timestamp-converter';

// ----------------------------------------------------------------------

export function TimestampView() {
  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AccessTimeRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            유닉스 타임스탬프 & 글로벌 시간대
          </Typography>
          <Chip
            label="Epoch ⇄ KST/UTC/ISO-8601"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          서버 개발 및 데이터 분석을 위한 Unix Epoch Timestamp(초·밀리초)와 현지 시간 상호 변환 및
          전 세계 주요 도시의 실시간 시차를 시뮬레이션합니다.
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <TimestampConverter />
      </Box>
    </DashboardContent>
  );
}
