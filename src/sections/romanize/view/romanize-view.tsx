'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { RomanizeConverter } from '../components/romanize-converter';

// ----------------------------------------------------------------------

export function RomanizeView() {
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
                국립국어원 표준 로마자 표기 변환기
              </Typography>
              <Chip
                label="국어의 로마자 표기법 (문화관광부 고시)"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="비음화·유음화 음운 변동 자동 반영"
                size="small"
                color="success"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              여권 인명 표기, 도로명 주소, 관광 안내 표지판을 위한 국립국어원 표준 로마자 표기법 변환기입니다.
              비음화(백마 ➔ Baengma), 유음화(신라 ➔ Silla) 등 복잡한 한국어 자음동화 규칙을 자동으로 적용합니다.
            </Typography>
          </Box>
        </Box>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          <RomanizeConverter />
        </Box>
      </Box>
    </DashboardContent>
  );
}
