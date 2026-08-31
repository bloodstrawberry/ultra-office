'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import RadioRoundedIcon from '@mui/icons-material/RadioRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
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
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
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
                모스 부호 변환기 & 스튜디오
              </Typography>
              <Chip
                label="국문/영문 표준 지원"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                icon={<FlashOnRoundedIcon sx={{ fontSize: 16 }} />}
                label="소리 · 불빛 동시 송신"
                size="small"
                color="warning"
                variant="soft"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              한국어(한글 자모 자동 분해/조합), 영어, 숫자, 특수기호를 모스 부호로 양방향 변환하고,
              Web Audio 사운드 및 광학 불빛 스트로브로 실시간 재생·저장하며 글자 형상 연상 암기법을 제공합니다.
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
              icon={<GraphicEqRoundedIcon />}
              iconPosition="start"
              label="양방향 변환 & 플레이어"
            />
            <Tab
              value="mnemonic"
              icon={<LightbulbRoundedIcon />}
              iconPosition="start"
              label="💡 시각적 연상 암기법 & 원리"
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
        </Card>

        {/* Scrollable Content Viewport */}
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: { xs: 0, md: 1 },
            pb: 4,
          }}
        >
          {currentTab === 'converter' && <MorseConverterTab />}
          {currentTab === 'mnemonic' && <MorseMnemonicsTab />}
          {currentTab === 'keyer' && <MorseKeyerTab />}
          {currentTab === 'chart' && <MorseChartTab />}
        </Box>
      </Box>
    </DashboardContent>
  );
}
