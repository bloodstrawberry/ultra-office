'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { SemaphoreConverterTab } from '../components/semaphore-converter-tab';
import { SemaphoreChartTab } from '../components/semaphore-chart-tab';

// ----------------------------------------------------------------------

export function SemaphoreView() {
  const [currentTab, setCurrentTab] = useState<'converter' | 'chart'>('converter');

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <FlagRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            해군 수기 신호(Semaphore) & 해상 신호기
          </Typography>
          <Chip
            label="8방위 깃발 & ICS 국제 해상 신호기"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          해군 및 상선에서 사용하는 수기 신호(Flag Semaphore)와 국제 해상 신호기를 실시간으로
          변환하고 깃발 애니메이션으로 재생합니다.
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="converter"
            icon={<FlagRoundedIcon />}
            iconPosition="start"
            label="수기 신호 변환 & 애니메이션"
          />
          <Tab
            value="chart"
            icon={<MenuBookRoundedIcon />}
            iconPosition="start"
            label="수기 신호 및 해상 신호기 도감"
          />
        </Tabs>
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
        {currentTab === 'converter' && <SemaphoreConverterTab />}
        {currentTab === 'chart' && <SemaphoreChartTab />}
      </Box>
    </DashboardContent>
  );
}
