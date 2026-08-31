'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { BrailleConverterTab } from '../components/braille-converter-tab';
import { BrailleChartTab } from '../components/braille-chart-tab';

// ----------------------------------------------------------------------

export function BrailleView() {
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
                훈맹정음 점자(Braille) 스튜디오
              </Typography>
              <Chip
                label="국문 표준 훈맹정음 & 영문 6점자"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="3D 엠보싱 촉각 시각화"
                size="small"
                color="info"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              한국어(한글 표준 훈맹정음 약자 포함), 영어, 숫자, 특수기호를 표준 6점식 점자로
              변환하고 3D 촉각 보드로 시각화합니다.
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
              icon={<TouchAppRoundedIcon />}
              iconPosition="start"
              label="점자 양방향 변환 & 3D 촉각 보드"
            />
            <Tab
              value="chart"
              icon={<MenuBookRoundedIcon />}
              iconPosition="start"
              label="훈맹정음 점자 일람표 / 도감"
            />
          </Tabs>
        </Card>

        {/* Scrollable Viewport */}
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: { xs: 0, md: 1 }, pb: 4 }}>
          {currentTab === 'converter' && <BrailleConverterTab />}
          {currentTab === 'chart' && <BrailleChartTab />}
        </Box>
      </Box>
    </DashboardContent>
  );
}
