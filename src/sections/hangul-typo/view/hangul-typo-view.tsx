'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { HangulTypoConverter } from '../components/hangul-typo-converter';

// ----------------------------------------------------------------------

export function HangulTypoView() {
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
          <KeyboardRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            한영 타자 오타 자동 복원기
          </Typography>
          <Chip
            label="QWERTY ⇄ 2벌식 오토마타"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          한영 키 전환을 깜빡하고 입력한 영타 오타(dkssudgktpdy)나 한타 오타를 원래 의도했던
          자연스러운 문장(안녕하세요)으로 실시간 자동 복원합니다.
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
        <HangulTypoConverter />
      </Box>
    </DashboardContent>
  );
}
