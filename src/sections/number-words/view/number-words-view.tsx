'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { NumberWordsConverter } from '../components/number-words-converter';

// ----------------------------------------------------------------------

export function NumberWordsView() {
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
                금액 한글/한자 표기 변환기
              </Typography>
              <Chip
                label="표준 한글 & 위조방지 갖은자"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="세금계산서 공급가액/VAT 분리"
                size="small"
                color="info"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              계약서, 영수증, 세금계산서 작성을 위한 숫자 ⇄ 한글 금액 표기(일억 원정) 및
              금융 위변조 방지 한자 갖은자(壹億 圓整), 영문 통화 표기를 실시간 생성합니다.
            </Typography>
          </Box>
        </Box>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          <NumberWordsConverter />
        </Box>
      </Box>
    </DashboardContent>
  );
}
