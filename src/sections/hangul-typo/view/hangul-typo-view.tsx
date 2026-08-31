'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { HangulTypoConverter } from '../components/hangul-typo-converter';

// ----------------------------------------------------------------------

export function HangulTypoView() {
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
                한영 타자 오타 자동 복원기
              </Typography>
              <Chip
                label="QWERTY ⇄ 2벌식 오토마타"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="영타·한타 오타 실시간 감지"
                size="small"
                color="success"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              한영 키 전환을 깜빡하고 입력한 영타 오타(dkssudgktpdy)나 한타 오타를 원래 의도했던
              자연스러운 문장(안녕하세요)으로 실시간 자동 복원합니다.
            </Typography>
          </Box>
        </Box>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          <HangulTypoConverter />
        </Box>
      </Box>
    </DashboardContent>
  );
}
