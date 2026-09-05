'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { BrailleChartTab } from '../components/braille-chart-tab';
import { BrailleConverterTab } from '../components/braille-converter-tab';

// ----------------------------------------------------------------------

export function BrailleView() {
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            훈맹정음 점자(Braille) 스튜디오
          </Typography>
          <Chip
            label="국문 표준 훈맹정음 & 영문 6점자"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          한국어(한글 표준 훈맹정음 약자 포함), 영어, 숫자, 특수기호를 표준 6점식 점자로 변환하고 3D
          촉각 보드로 시각화합니다.
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
            icon={<TouchAppRoundedIcon />}
            iconPosition="start"
            label="점자 변환 & 3D 촉각 보드"
          />
          <Tab
            value="chart"
            icon={<MenuBookRoundedIcon />}
            iconPosition="start"
            label="훈맹정음 점자 일람표"
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
        {currentTab === 'converter' && <BrailleConverterTab />}
        {currentTab === 'chart' && <BrailleChartTab />}
      </Box>
    </DashboardContent>
  );
}
