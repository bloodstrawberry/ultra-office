'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { TimestampConverter } from '../components/timestamp-converter';

// ----------------------------------------------------------------------

export function TimestampView() {
  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.5,
            mb: 3,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                유닉스 타임스탬프 & 글로벌 시간대
              </Typography>
              <Chip
                label="Epoch 초/밀리초 ⇄ KST/UTC/ISO-8601"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="전 세계 10대 도시 실시간 시차 슬라이더"
                size="small"
                color="info"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              서버 개발 및 데이터 분석을 위한 Unix Epoch Timestamp(초·밀리초)와 현지 시간 상호 변환 및
              전 세계 주요 도시(서울, 도쿄, 뉴욕, 런던, 파리, 시드니 등)의 실시간 시차를 시뮬레이션합니다.
            </Typography>
          </Box>
        </Box>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          <TimestampConverter />
        </Box>
      </Box>
    </DashboardContent>
  );
}
