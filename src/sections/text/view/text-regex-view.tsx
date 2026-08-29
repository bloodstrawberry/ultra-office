'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { RegexStudioTab } from '../components/regex-studio-tab';

// ----------------------------------------------------------------------

export function TextRegexView() {
  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        pb: 2,
      }}
    >
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          정규표현식 스튜디오 (Regex Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          실시간 정규표현식 매칭, 치환, 캡처 그룹 분석 및 120+종 실무 정규식 프리셋 라이브러리를
          제공합니다.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <RegexStudioTab />
      </Box>
    </DashboardContent>
  );
}
