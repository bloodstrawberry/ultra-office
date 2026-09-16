'use client';

import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';

import { SqldPracticeView } from '../sqld';

// ----------------------------------------------------------------------

export function SqlSqldView() {
  return (
    <DashboardContent
      maxWidth={false}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        [theme.breakpoints.up('lg')]: {
          overflowY: 'auto',
          overflowX: 'hidden',
        },
      })}
    >
      <Box sx={{ flex: '1 1 auto', minHeight: 0, pb: 6 }}>
        <SqldPracticeView />
      </Box>
    </DashboardContent>
  );
}
