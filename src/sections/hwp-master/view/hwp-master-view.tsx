'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { RhwpEditor } from '../components/rhwp-editor';

export function HwpMasterView() {
  return (
    <DashboardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}
          >
            <ArticleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            한글 파일 문서
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            HWP/HWPX 문서를 열고 편집한 뒤 원하는 한글 형식으로 다시 저장합니다.
          </Typography>
        </Box>

        <Chip label="rhwp · Rust + WebAssembly" color="primary" variant="soft" />
      </Box>

      <RhwpEditor />
    </DashboardContent>
  );
}
