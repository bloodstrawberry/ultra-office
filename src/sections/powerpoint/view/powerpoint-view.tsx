'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PptxSlideStudio } from 'src/sections/doc-master/components/pptx-slide-studio';

// ----------------------------------------------------------------------

export function PowerpointView() {
  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <SlideshowRoundedIcon sx={{ fontSize: 32, color: 'error.main' }} />
          파워 포인트 (Power Point)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          설치 없이 브라우저에서 16:9 프레젠테이션 슬라이드를 기획하고, 네이티브 차트 및 마스터
          서식이 적용된 PPTX 파일로 즉시 다운로드합니다.
        </Typography>
      </Box>

      {/* 2. Active PPTX Studio Workspace */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <PptxSlideStudio />
      </Box>
    </DashboardContent>
  );
}

export default PowerpointView;
