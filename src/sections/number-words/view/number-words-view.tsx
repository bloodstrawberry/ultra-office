'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { NumberWordsConverter } from '../components/number-words-converter';

// ----------------------------------------------------------------------

export function NumberWordsView() {
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
          <AttachMoneyRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            금액 한글/한자 표기 변환기
          </Typography>
          <Chip
            label="세금계산서 공급가액/VAT 분리"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          계약서, 영수증, 세금계산서 작성을 위한 숫자 ⇄ 한글 금액 표기(일억 원정) 및 금융 위변조
          방지 한자 갖은자(壹億 圓整), 영문 통화 표기를 실시간 생성합니다.
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
        <NumberWordsConverter />
      </Box>
    </DashboardContent>
  );
}
