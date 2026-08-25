'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { MarkdownStudio } from 'src/sections/diagram/components/markdown-studio';

// ----------------------------------------------------------------------

export function MarkdownView() {
  return (
    <DashboardContent>
      {/* 1. Page Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.3 }}>
            마크다운 스튜디오 (Markdown Studio)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            기획서(PRD), API 명세, 회의록, README 등 실무 마크다운 문서를 작성하고 실시간 미리보기를
            확인합니다.
          </Typography>
        </Box>
      </Box>

      {/* 2. Active Markdown Studio Workspace */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MarkdownStudio />
      </Box>
    </DashboardContent>
  );
}

export default MarkdownView;
