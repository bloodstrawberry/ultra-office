'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { RomanizeConverter } from '../components/romanize-converter';

// ----------------------------------------------------------------------

export function RomanizeView() {
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
          <TranslateRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            국립국어원 표준 로마자 표기 변환기
          </Typography>
          <Chip
            label="문화관광부 고시 표준"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          여권 인명 표기, 도로명 주소, 관광 안내 표지판을 위한 국립국어원 표준 로마자 표기법
          변환기입니다. 비음화(백마 → Baengma), 유음화(신라 → Silla) 등 음운 변동을 자동 반영합니다.
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
        <RomanizeConverter />
      </Box>
    </DashboardContent>
  );
}
