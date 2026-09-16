'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function SqlSqlpView() {
  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          SQLP 연습
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          SQL 전문가(SQLP) 국가공인 자격검정 대비 심화 튜닝 및 실습 연습실입니다.
        </Typography>
      </Box>

      <Card
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          p: 3,
          border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          minHeight: 0,
        }}
      >
        <WorkspacePremiumRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          SQLP 연습실 준비 중입니다.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
          SQLP 실습 콘텐츠 및 고난도 문제 풀이가 곧 제공될 예정입니다.
        </Typography>
      </Card>
    </DashboardContent>
  );
}
