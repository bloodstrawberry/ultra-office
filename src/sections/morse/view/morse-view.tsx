'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import RadioRoundedIcon from '@mui/icons-material/RadioRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { MorseConverterTab } from '../components/morse-converter-tab';
import { MorseMnemonicsTab } from '../components/morse-mnemonics-tab';
import { MorseKeyerTab } from '../components/morse-keyer-tab';
import { MorseChartTab } from '../components/morse-chart-tab';

// ----------------------------------------------------------------------

export function MorseView() {
  const [currentTab, setCurrentTab] = useState<'converter' | 'mnemonic' | 'keyer' | 'chart'>(
    'converter'
  );

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
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          모스 부호 변환기 & 스튜디오
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          한국어(한글 자모 자동 분해/조합), 영어, 숫자, 특수기호를 모스 부호로 양방향 변환하고, Web
          Audio 사운드 및 광학 불빛 스트로브로 실시간 재생·저장하며 글자 형상 연상 암기법을
          제공합니다.
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="converter"
            icon={<GraphicEqRoundedIcon />}
            iconPosition="start"
            label="양방향 변환 & 플레이어"
          />
          <Tab
            value="mnemonic"
            icon={<LightbulbRoundedIcon />}
            iconPosition="start"
            label="시각적 연상 암기법 & 원리"
          />
          <Tab
            value="keyer"
            icon={<RadioRoundedIcon />}
            iconPosition="start"
            label="인터랙티브 탭 키어"
          />
          <Tab
            value="chart"
            icon={<MenuBookRoundedIcon />}
            iconPosition="start"
            label="모스 부호 사전 / 도감"
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
        {currentTab === 'converter' && <MorseConverterTab />}
        {currentTab === 'mnemonic' && <MorseMnemonicsTab />}
        {currentTab === 'keyer' && <MorseKeyerTab />}
        {currentTab === 'chart' && <MorseChartTab />}
      </Box>
    </DashboardContent>
  );
}
