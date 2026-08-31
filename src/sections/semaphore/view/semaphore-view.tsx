'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
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
                해군 수기 신호(Semaphore) & 해상 신호기
              </Typography>
              <Chip
                label="8방위 깃발 신호 & ICS 국제 해상 신호기"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="실시간 수기병 애니메이션"
                size="small"
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              해군 및 상선에서 사용하는 수기 신호(Flag Semaphore)와 국제 해상 신호기(International Code of Signals)를
              실시간으로 변환하고 깃발 애니메이션으로 재생합니다.
            </Typography>
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Card
          sx={{
            mb: 3,
            p: 0.75,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 48,
                borderRadius: 1.5,
              },
            }}
          >
            <Tab
              value="converter"
              icon={<FlagRoundedIcon />}
              iconPosition="start"
              label="수기 신호 변환 & 애니메이션 플레이어"
            />
            <Tab
              value="chart"
              icon={<MenuBookRoundedIcon />}
              iconPosition="start"
              label="수기 신호 및 국제 해상 신호기 도감"
            />
          </Tabs>
        </Card>

        {/* Scrollable Content Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          {currentTab === 'converter' && <SemaphoreConverterTab />}
          {currentTab === 'chart' && <SemaphoreChartTab />}
        </Box>
      </Box>
    </DashboardContent>
  );
}
